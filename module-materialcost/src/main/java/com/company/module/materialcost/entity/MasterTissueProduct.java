package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 화장지 제품 마스터
 */
@Entity
@Table(name = "mc_master_tissue_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MasterTissueProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TISSUE_PRODUCT_ID")
    private Long tissueProductId;

    @Column(name = "CATEGORY", nullable = false, length = 50)
    private String category;

    @Column(name = "PRODUCT_NAME", nullable = false, length = 100)
    private String productName;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public MasterTissueProduct(String category, String productName) {
        this.category = category;
        this.productName = productName;
    }

    public void update(String category, String productName) {
        this.category = category;
        this.productName = productName;
    }
}
