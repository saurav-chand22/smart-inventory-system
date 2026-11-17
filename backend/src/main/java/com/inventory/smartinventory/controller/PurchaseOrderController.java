package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.PurchaseOrderRequest;
import com.inventory.smartinventory.entity.PurchaseOrder;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.enums.PurchaseOrderStatus;
import com.inventory.smartinventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrder>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Purchase orders retrieved", purchaseOrderService.getAllPurchaseOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase order details", purchaseOrderService.getPurchaseOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createOrder(
            @Valid @RequestBody PurchaseOrderRequest request,
            @AuthenticationPrincipal User user) {
        PurchaseOrder po = purchaseOrderService.createPurchaseOrder(request, user);
        return ResponseEntity.ok(ApiResponse.success("Purchase order created", po));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updateStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrderStatus status,
            @AuthenticationPrincipal User user) {
        PurchaseOrder po = purchaseOrderService.updateStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.success("PO status updated to " + status, po));
    }
}
