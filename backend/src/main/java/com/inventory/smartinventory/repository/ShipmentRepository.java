package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.Shipment;
import com.inventory.smartinventory.entity.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    Optional<Shipment> findByCustomerOrderId(Long orderId);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findAllByOrderByShippedDateDesc();
    Long countByStatus(ShipmentStatus status);

    @Query("SELECT MAX(s.id) FROM Shipment s")
    Long findMaxId();
}
