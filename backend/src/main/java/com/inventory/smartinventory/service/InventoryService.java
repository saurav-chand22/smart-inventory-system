package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.StockAdjustmentRequest;
import com.inventory.smartinventory.entity.Inventory;
import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.InsufficientStockException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.InventoryRepository;
import com.inventory.smartinventory.repository.ProductRepository;
import com.inventory.smartinventory.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private StockTransactionService stockTransactionService;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public Optional<Inventory> getInventory(Long productId, Long warehouseId) {
        return inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
    }

    @Transactional
    public Inventory addStock(Product product, Warehouse warehouse, int quantity, String refId, String reason, User user) {
        Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElse(new Inventory(product, warehouse, 0, 0));

        inv.setQuantityAvailable(inv.getQuantityAvailable() + quantity);
        Inventory saved = inventoryRepository.save(inv);

        stockTransactionService.recordTransaction(product, warehouse, TransactionType.STOCK_IN, quantity, refId, reason, user);
        return saved;
    }

    @Transactional
    public Inventory adjustStock(StockAdjustmentRequest request, User user) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        Inventory inv = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElse(new Inventory(product, warehouse, 0, 0));

        int newAvailable = inv.getQuantityAvailable() + request.getAdjustmentQuantity();
        if (newAvailable < 0) {
            throw new InsufficientStockException("Inventory cannot become negative. Current available: " + inv.getQuantityAvailable() + ", adjustment: " + request.getAdjustmentQuantity());
        }

        inv.setQuantityAvailable(newAvailable);
        Inventory saved = inventoryRepository.save(inv);

        stockTransactionService.recordTransaction(
                product, warehouse, TransactionType.STOCK_ADJUSTMENT,
                request.getAdjustmentQuantity(), "ADJ-" + (System.currentTimeMillis() % 100000),
                request.getReason() != null ? request.getReason() : "Manual stock adjustment", user
        );
        return saved;
    }
}
