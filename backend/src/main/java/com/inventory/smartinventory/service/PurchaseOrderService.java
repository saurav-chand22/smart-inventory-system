package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.PurchaseOrderRequest;
import com.inventory.smartinventory.entity.*;
import com.inventory.smartinventory.entity.enums.PurchaseOrderStatus;
import com.inventory.smartinventory.exception.BusinessRuleException;
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
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryService inventoryService;

    private synchronized String generateNextPoNumber() {
        Long maxId = purchaseOrderRepository.findMaxId();
        long nextNum = (maxId != null) ? maxId + 1 : 1;
        while (purchaseOrderRepository.findByPoNumber("PO-" + nextNum).isPresent()) {
            nextNum++;
        }
        return "PO-" + nextNum;
    }

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByOrderDateDesc();
    }

    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("A purchase order must contain at least one product item");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generateNextPoNumber());
        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setStatus(PurchaseOrderStatus.PENDING);
        po.setCreatedBy(user);
        po.setOrderDate(LocalDateTime.now());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseOrderItem> poItems = new ArrayList<>();

        for (PurchaseOrderRequest.PurchaseOrderItemDto itemDto : request.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            BigDecimal price = itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : product.getUnitPrice();
            PurchaseOrderItem item = new PurchaseOrderItem(po, product, itemDto.getQuantity(), price);
            poItems.add(item);

            total = total.add(price.multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        po.setItems(poItems);
        po.setTotalAmount(total);

        return purchaseOrderRepository.save(po);
    }

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrder updateStatus(Long poId, PurchaseOrderStatus newStatus, User user) {
        PurchaseOrder po = getPurchaseOrderById(poId);

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot alter status of a " + po.getStatus() + " purchase order");
        }

        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            for (PurchaseOrderItem item : po.getItems()) {
                item.setReceivedQuantity(item.getOrderedQuantity());
                inventoryService.addStock(
                        item.getProduct(), po.getWarehouse(), item.getOrderedQuantity(),
                        po.getPoNumber(), "Received from Purchase Order " + po.getPoNumber(), user
                );
            }
            po.setReceivedDate(LocalDateTime.now());
        }

        po.setStatus(newStatus);
        return purchaseOrderRepository.save(po);
    }
}
