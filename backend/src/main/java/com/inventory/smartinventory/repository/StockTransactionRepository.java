package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductId(Long productId);
    List<StockTransaction> findByWarehouseId(Long warehouseId);
    List<StockTransaction> findTop50ByOrderByTransactionDateDesc();
}
