package com.inventory.smartinventory.dto;

public class DashboardStatsResponse {
    private long totalProducts;
    private long totalSuppliers;
    private long totalWarehouses;
    private long totalInventoryQuantity;
    private long lowStockProducts;
    private long pendingPurchaseOrders;
    private long pendingCustomerOrders;
    private long activeShipments;

    public DashboardStatsResponse() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalSuppliers() { return totalSuppliers; }
    public void setTotalSuppliers(long totalSuppliers) { this.totalSuppliers = totalSuppliers; }
    public long getTotalWarehouses() { return totalWarehouses; }
    public void setTotalWarehouses(long totalWarehouses) { this.totalWarehouses = totalWarehouses; }
    public long getTotalInventoryQuantity() { return totalInventoryQuantity; }
    public void setTotalInventoryQuantity(long totalInventoryQuantity) { this.totalInventoryQuantity = totalInventoryQuantity; }
    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }
    public long getPendingPurchaseOrders() { return pendingPurchaseOrders; }
    public void setPendingPurchaseOrders(long pendingPurchaseOrders) { this.pendingPurchaseOrders = pendingPurchaseOrders; }
    public long getPendingCustomerOrders() { return pendingCustomerOrders; }
    public void setPendingCustomerOrders(long pendingCustomerOrders) { this.pendingCustomerOrders = pendingCustomerOrders; }
    public long getActiveShipments() { return activeShipments; }
    public void setActiveShipments(long activeShipments) { this.activeShipments = activeShipments; }
}
