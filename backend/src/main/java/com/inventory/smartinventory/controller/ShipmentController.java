package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.ShipmentRequest;
import com.inventory.smartinventory.entity.Shipment;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.entity.enums.ShipmentStatus;
import com.inventory.smartinventory.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Shipment>>> getAllShipments() {
        return ResponseEntity.ok(ApiResponse.success("Shipments retrieved", shipmentService.getAllShipments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shipment>> getShipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Shipment details", shipmentService.getShipmentById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Shipment>> createShipment(
            @Valid @RequestBody ShipmentRequest request,
            @AuthenticationPrincipal User user) {
        Shipment shipment = shipmentService.createShipment(request, user);
        return ResponseEntity.ok(ApiResponse.success("Shipment created", shipment));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Shipment>> updateStatus(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status,
            @AuthenticationPrincipal User user) {
        Shipment shipment = shipmentService.updateShipmentStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated to " + status, shipment));
    }
}
