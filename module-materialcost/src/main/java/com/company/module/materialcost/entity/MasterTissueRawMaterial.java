package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 화장지 원자재 마스터
 */
@Entity
@Table(name = "mc_master_tissue_raw_materials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MasterTissueRawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TISSUE_RAW_MATERIAL_ID")
    private Long tissueRawMaterialId;

    @Column(name = "CATEGORY", nullable = false, length = 50)
    private String category;

    @Column(name = "MATERIAL_CODE", nullable = false, length = 30)
    private String materialCode;

    @Column(name = "MATERIAL_NAME", nullable = false, length = 200)
    private String materialName;

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
    public MasterTissueRawMaterial(String category, String materialCode, String materialName) {
        this.category = category;
        this.materialCode = materialCode;
        this.materialName = materialName;
    }

    public void update(String category, String materialCode, String materialName) {
        this.category = category;
        this.materialCode = materialCode;
        this.materialName = materialName;
    }
}
