package com.inventory.smartinventory.service;

import com.inventory.smartinventory.dto.WarehouseRequest;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.exception.BusinessRuleException;
import com.inventory.smartinventory.exception.ResourceNotFoundException;
import com.inventory.smartinventory.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
    }

    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByName(request.getName())) {
            throw new BusinessRuleException("Warehouse with name '" + request.getName() + "' already exists");
        }
        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        warehouse.setCapacity(request.getCapacity());
        warehouse.setContactNumber(request.getContactNumber());
        warehouse.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public Warehouse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(id);
        if (!warehouse.getName().equalsIgnoreCase(request.getName()) && warehouseRepository.existsByName(request.getName())) {
            throw new BusinessRuleException("Warehouse with name '" + request.getName() + "' already exists");
        }
        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());
        warehouse.setCapacity(request.getCapacity());
        warehouse.setContactNumber(request.getContactNumber());
        if (request.getStatus() != null) {
            warehouse.setStatus(request.getStatus());
        }
        return warehouseRepository.save(warehouse);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = getWarehouseById(id);
        try {
            warehouseRepository.delete(warehouse);
        } catch (Exception e) {
            throw new BusinessRuleException("Cannot delete warehouse containing stock or pending orders.");
        }
    }
}
