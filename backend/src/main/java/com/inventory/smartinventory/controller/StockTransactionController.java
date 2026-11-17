package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.entity.StockTransaction;
import com.inventory.smartinventory.service.StockTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-transactions")
public class StockTransactionController {

    @Autowired
    private StockTransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getTransactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId) {
        if (productId != null) {
            return ResponseEntity.ok(ApiResponse.success("Product transactions", transactionService.getTransactionsByProduct(productId)));
        }
        if (warehouseId != null) {
            return ResponseEntity.ok(ApiResponse.success("Warehouse transactions", transactionService.getTransactionsByWarehouse(warehouseId)));
        }
        return ResponseEntity.ok(ApiResponse.success("Recent stock transactions", transactionService.getRecentTransactions()));
    }
}
