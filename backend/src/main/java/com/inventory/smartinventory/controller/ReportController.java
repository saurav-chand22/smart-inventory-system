package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.entity.StockTransaction;
import com.inventory.smartinventory.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport() {
        return ResponseEntity.ok(ApiResponse.success("Inventory report", reportService.generateInventoryReport()));
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<ApiResponse<List<StockTransaction>>> getStockMovementReport() {
        return ResponseEntity.ok(ApiResponse.success("Stock movement report", reportService.getStockMovementAuditReport()));
    }
}
