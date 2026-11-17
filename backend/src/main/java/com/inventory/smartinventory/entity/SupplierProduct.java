package com.inventory.smartinventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supplier_product", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"supplier_id", "product_id"})
})
public class SupplierProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "supplier_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal supplierPrice;

    @Column(name = "lead_time_days", nullable = false)
    private Integer leadTimeDays = 7;

    public SupplierProduct() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public BigDecimal getSupplierPrice() { return supplierPrice; }
    public void setSupplierPrice(BigDecimal supplierPrice) { this.supplierPrice = supplierPrice; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
}
