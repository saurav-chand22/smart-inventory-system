package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.StockAdjustmentRequest;
import com.inventory.smartinventory.entity.Inventory;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Inventory>>> getAllInventory(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId) {
        if (warehouseId != null) {
            return ResponseEntity.ok(ApiResponse.success("Inventory by warehouse", inventoryService.getInventoryByWarehouse(warehouseId)));
        }
        if (productId != null) {
            return ResponseEntity.ok(ApiResponse.success("Inventory by product", inventoryService.getInventoryByProduct(productId)));
        }
        return ResponseEntity.ok(ApiResponse.success("All inventory records", inventoryService.getAllInventory()));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<Inventory>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            @AuthenticationPrincipal User user) {
        Inventory updated = inventoryService.adjustStock(request, user);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", updated));
    }
}
