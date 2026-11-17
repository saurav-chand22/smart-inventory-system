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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Transactional
    public CustomerOrder createCustomerOrder(CustomerOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one product item");
        }

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber("ORD-" + (System.currentTimeMillis() % 1000000));
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

        for (OrderItem item : order.getItems()) {
            Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId)
                    .orElseThrow(() -> new InsufficientStockException("Product '" + item.getProduct().getName() + "' is not available in warehouse '" + warehouse.getName() + "'"));

            if (inv.getQuantityAvailable() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + item.getProduct().getName() + "'. Required: " + item.getQuantity() + ", Available: " + inv.getQuantityAvailable());
            }
        }

        for (OrderItem item : order.getItems()) {
            Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId).get();
            inv.setQuantityAvailable(inv.getQuantityAvailable() - item.getQuantity());
            inv.setQuantityReserved(inv.getQuantityReserved() + item.getQuantity());
            inventoryRepository.save(inv);

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
