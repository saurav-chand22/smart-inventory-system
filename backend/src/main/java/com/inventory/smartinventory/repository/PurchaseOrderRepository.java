package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.PurchaseOrder;
import com.inventory.smartinventory.entity.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findAllByOrderByOrderDateDesc();
    Long countByStatus(PurchaseOrderStatus status);

    @Query("SELECT MAX(po.id) FROM PurchaseOrder po")
    Long findMaxId();
}
