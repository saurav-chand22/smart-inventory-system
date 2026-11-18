package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByWarehouseId(Long warehouseId);
    List<Inventory> findByProductId(Long productId);
    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId")
    Optional<Inventory> lockByProductIdAndWarehouseId(@Param("productId") Long productId,
                                                     @Param("warehouseId") Long warehouseId);

    @Query("SELECT COALESCE(SUM(i.quantityAvailable), 0) FROM Inventory i")
    Long getTotalAvailableStock();

    @Query("SELECT COALESCE(SUM(i.quantityReserved), 0) FROM Inventory i")
    Long getTotalReservedStock();

    @Query("SELECT COALESCE(SUM(i.quantityAvailable), 0) FROM Inventory i WHERE i.product.id = :productId")
    Integer getTotalAvailableForProduct(@Param("productId") Long productId);
}
