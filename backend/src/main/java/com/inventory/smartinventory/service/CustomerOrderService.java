package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.CustomerOrderRequest;
import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.InsufficientStockException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CustomerOrderService {

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockTransactionService stockTransactionService;

    public List<CustomerOrder> getAllCustomerOrders() {
        return customerOrderRepository.findAllByOrderByOrderDateDesc();
    }

    public CustomerOrder getCustomerOrderById(Long id) {
        return customerOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));
    }

    private synchronized String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        String prefix = "ORD-" + datePart + "-";
        long count = customerOrderRepository.countByOrderNumberPrefix(prefix);
        long seq = count + 1;
        // Ensure uniqueness in case of gaps/duplicates
        while (customerOrderRepository.findByOrderNumber(prefix + seq).isPresent()) {
            seq++;
        }
        return prefix + seq;
    }

    @Transactional
    public CustomerOrder createCustomerOrder(CustomerOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one product item");
        }

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(CustomerOrderStatus.PENDING);
        order.setCreatedBy(user);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (CustomerOrderRequest.CustomerOrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            BigDecimal subtotal = product.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            OrderItem item = new OrderItem(order, product, itemDto.getQuantity(), product.getUnitPrice(), subtotal);
            items.add(item);
            total = total.add(subtotal);
        }

        order.setItems(items);
        order.setTotalAmount(total);

        return customerOrderRepository.save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerOrder confirmAndReserveStock(Long orderId, Long warehouseId, User user) {
        CustomerOrder order = getCustomerOrderById(orderId);
        if (order.getStatus() != CustomerOrderStatus.PENDING) {
            throw new BusinessRuleException("Only PENDING orders can be confirmed and reserved. Current status: " + order.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        // Aggregate total required quantity per product (handles duplicate line items for same product)
        Map<Long, Integer> requiredQtyByProduct = new java.util.HashMap<>();
        for (OrderItem item : order.getItems()) {
            requiredQtyByProduct.merge(item.getProduct().getId(), item.getQuantity(), Integer::sum);
        }

        // Validate aggregated quantities against available stock before making any changes
        for (Map.Entry<Long, Integer> entry : requiredQtyByProduct.entrySet()) {
            Long productId = entry.getKey();
            int totalRequired = entry.getValue();
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(productId, warehouseId)
                    .orElseThrow(() -> new InsufficientStockException("Product is not available in warehouse '" + warehouse.getName() + "'"));

            if (inv.getQuantityAvailable() < totalRequired) {
                throw new InsufficientStockException("Insufficient stock for product '" + inv.getProduct().getName() + "'. Required: " + totalRequired + ", Available: " + inv.getQuantityAvailable());
            }
        }

        // Deduct aggregated quantities per product (single save per product, prevents double-deduction)
        for (Map.Entry<Long, Integer> entry : requiredQtyByProduct.entrySet()) {
            Long productId = entry.getKey();
            int totalRequired = entry.getValue();
            Inventory inv = inventoryRepository.lockByProductIdAndWarehouseId(productId, warehouseId).get();
            inv.setQuantityAvailable(inv.getQuantityAvailable() - totalRequired);
            inv.setQuantityReserved(inv.getQuantityReserved() + totalRequired);
            inventoryRepository.save(inv);
        }

        // Record stock transactions per order line item (for detailed audit trail)
        for (OrderItem item : order.getItems()) {
            stockTransactionService.recordTransaction(
                    item.getProduct(), warehouse, TransactionType.STOCK_RESERVATION,
                    item.getQuantity(), order.getOrderNumber(), "Reserved stock for Order " + order.getOrderNumber(), user
            );
        }

        order.setStatus(CustomerOrderStatus.CONFIRMED);
        return customerOrderRepository.save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public CustomerOrder cancelOrder(Long orderId, Long warehouseId, User user) {
        CustomerOrder order = getCustomerOrderById(orderId);

        if (order.getStatus() == CustomerOrderStatus.DELIVERED || order.getStatus() == CustomerOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot cancel an order that is already " + order.getStatus());
        }

        if (order.getStatus() == CustomerOrderStatus.CONFIRMED || order.getStatus() == CustomerOrderStatus.PROCESSING) {
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

            for (OrderItem item : order.getItems()) {
                inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId).ifPresent(inv -> {
                    int releaseQty = Math.min(inv.getQuantityReserved(), item.getQuantity());
                    inv.setQuantityReserved(inv.getQuantityReserved() - releaseQty);
                    inv.setQuantityAvailable(inv.getQuantityAvailable() + releaseQty);
                    inventoryRepository.save(inv);

                    stockTransactionService.recordTransaction(
                            item.getProduct(), warehouse, TransactionType.STOCK_RELEASE,
                            releaseQty, order.getOrderNumber(), "Released reserved stock due to order cancellation", user
                    );
                });
            }
        }

        order.setStatus(CustomerOrderStatus.CANCELLED);
        return customerOrderRepository.save(order);
    }
}
