package com.inventory.smartinventory.dto;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Adjustment quantity is required")
    private Integer adjustmentQuantity;

    private String reason;

    public StockAdjustmentRequest() {}
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public Integer getAdjustmentQuantity() { return adjustmentQuantity; }
    public void setAdjustmentQuantity(Integer adjustmentQuantity) { this.adjustmentQuantity = adjustmentQuantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
