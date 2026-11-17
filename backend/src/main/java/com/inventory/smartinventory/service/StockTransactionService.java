package com.inventory.smartinventory.service;

import com.inventory.smartinventory.entity.Product;
import com.inventory.smartinventory.entity.StockTransaction;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.entity.enums.TransactionType;
import com.inventory.smartinventory.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockTransactionService {

    @Autowired
    private StockTransactionRepository transactionRepository;

    @Transactional
    public StockTransaction recordTransaction(Product product, Warehouse warehouse, TransactionType type,
                                             int quantity, String referenceId, String description, User user) {
        StockTransaction tx = new StockTransaction(product, warehouse, type, quantity, referenceId, description, user);
        return transactionRepository.save(tx);
    }

    public List<StockTransaction> getRecentTransactions() {
        return transactionRepository.findTop50ByOrderByTransactionDateDesc();
    }

    public List<StockTransaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductId(productId);
    }

    public List<StockTransaction> getTransactionsByWarehouse(Long warehouseId) {
        return transactionRepository.findByWarehouseId(warehouseId);
    }
}
