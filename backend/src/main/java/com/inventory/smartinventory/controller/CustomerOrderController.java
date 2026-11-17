package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.CustomerOrderRequest;
import com.inventory.smartinventory.entity.CustomerOrder;
import com.inventory.smartinventory.entity.User;
import com.inventory.smartinventory.service.CustomerOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-orders")
public class CustomerOrderController {

    @Autowired
    private CustomerOrderService customerOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerOrder>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Customer orders retrieved", customerOrderService.getAllCustomerOrders()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerOrder>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Customer order details", customerOrderService.getCustomerOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerOrder>> createOrder(
            @Valid @RequestBody CustomerOrderRequest request,
            @AuthenticationPrincipal User user) {
        CustomerOrder order = customerOrderService.createCustomerOrder(request, user);
        return ResponseEntity.ok(ApiResponse.success("Customer order created", order));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<CustomerOrder>> confirmOrder(
            @PathVariable Long id,
            @RequestParam Long warehouseId,
            @AuthenticationPrincipal User user) {
        CustomerOrder order = customerOrderService.confirmAndReserveStock(id, warehouseId, user);
        return ResponseEntity.ok(ApiResponse.success("Order confirmed and inventory reserved", order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<CustomerOrder>> cancelOrder(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Long warehouseId,
            @AuthenticationPrincipal User user) {
        CustomerOrder order = customerOrderService.cancelOrder(id, warehouseId, user);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled and reserved stock released", order));
    }
}
