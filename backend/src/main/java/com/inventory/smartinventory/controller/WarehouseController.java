package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.WarehouseRequest;
import com.inventory.smartinventory.entity.Warehouse;
import com.inventory.smartinventory.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Warehouse>>> getAllWarehouses() {
        return ResponseEntity.ok(ApiResponse.success("Warehouses retrieved", warehouseService.getAllWarehouses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Warehouse>> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Warehouse details", warehouseService.getWarehouseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Warehouse>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Warehouse created successfully", warehouseService.createWarehouse(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Warehouse>> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Warehouse updated successfully", warehouseService.updateWarehouse(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deleted successfully", null));
    }
}
