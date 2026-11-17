package com.inventory.smartinventory.repository;

import com.inventory.smartinventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByName(String name);
    Boolean existsByName(String name);
}
