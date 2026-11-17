package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.DashboardStatsResponse;
import com.inventory.smartinventory.entity.enums.CustomerOrderStatus;
import com.inventory.smartinventory.entity.enums.PurchaseOrderStatus;
import com.inventory.smartinventory.entity.enums.ShipmentStatus;
import com.inventory.smartinventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    public DashboardStatsResponse getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalProducts(productRepository.count());
        stats.setTotalSuppliers(supplierRepository.count());
        stats.setTotalWarehouses(warehouseRepository.count());

        Long available = inventoryRepository.getTotalAvailableStock();
        Long reserved = inventoryRepository.getTotalReservedStock();
        stats.setTotalInventoryQuantity((available != null ? available : 0) + (reserved != null ? reserved : 0));

        stats.setLowStockProducts(productRepository.findLowStockProducts().size());
        stats.setPendingPurchaseOrders(purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING)
                + purchaseOrderRepository.countByStatus(PurchaseOrderStatus.ORDERED));
        stats.setPendingCustomerOrders(customerOrderRepository.countByStatus(CustomerOrderStatus.PENDING)
                + customerOrderRepository.countByStatus(CustomerOrderStatus.CONFIRMED));
        stats.setActiveShipments(shipmentRepository.countByStatus(ShipmentStatus.PREPARING)
                + shipmentRepository.countByStatus(ShipmentStatus.DISPATCHED)
                + shipmentRepository.countByStatus(ShipmentStatus.IN_TRANSIT));

        return stats;
    }

    public Map<String, Object> getChartData() {
        Map<String, Object> charts = new HashMap<>();

        Map<String, Long> orderStatuses = new HashMap<>();
        for (CustomerOrderStatus status : CustomerOrderStatus.values()) {
            orderStatuses.put(status.name(), customerOrderRepository.countByStatus(status));
        }
        charts.put("orderStatusBreakdown", orderStatuses);

        Map<String, Long> poStatuses = new HashMap<>();
        for (PurchaseOrderStatus status : PurchaseOrderStatus.values()) {
            poStatuses.put(status.name(), purchaseOrderRepository.countByStatus(status));
        }
        charts.put("purchaseOrderStatusBreakdown", poStatuses);

        return charts;
    }
}
