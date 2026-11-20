package com.inventory.smartinventory.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Unit price must be >= 0")
    private BigDecimal unitPrice;

    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level must be >= 0")
    private Integer reorderLevel = 10;

    public ProductRequest() {}
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
}
