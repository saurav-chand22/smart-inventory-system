package com.inventory.smartinventory.controller;

import com.inventory.smartinventory.dto.ApiResponse;
import com.inventory.smartinventory.dto.DashboardStatsResponse;
import com.inventory.smartinventory.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics", dashboardService.getStats()));
    }

    @GetMapping("/charts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCharts() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard chart data", dashboardService.getChartData()));
    }
}
