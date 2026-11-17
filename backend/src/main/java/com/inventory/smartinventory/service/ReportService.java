package com.inventory.smartinventory.service;

import com.inventory.smartinventory.entity.Inventory;
import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.entity.StockTransaction;
import com.inventory.smartinventory.repository.InventoryRepository;
import com.inventory.smartinventory.repository.ProductRepository;
import com.inventory.smartinventory.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    public Map<String, Object> generateInventoryReport() {
        Map<String, Object> report = new HashMap<>();
        List<Inventory> allInventory = inventoryRepository.findAll();
        List<Product> lowStock = productRepository.findLowStockProducts();

        long totalUnits = 0;
        double totalValue = 0.0;
        for (Inventory inv : allInventory) {
            int qty = inv.getQuantityAvailable() + inv.getQuantityReserved();
            totalUnits += qty;
            totalValue += qty * inv.getProduct().getUnitPrice().doubleValue();
        }

        report.put("totalStockUnits", totalUnits);
        report.put("totalInventoryValuation", Math.round(totalValue * 100.0) / 100.0);
        report.put("lowStockProductCount", lowStock.size());
        report.put("lowStockProducts", lowStock);
        report.put("inventoryRecords", allInventory);

        return report;
    }

    public List<StockTransaction> getStockMovementAuditReport() {
        return stockTransactionRepository.findTop50ByOrderByTransactionDateDesc();
    }
}
