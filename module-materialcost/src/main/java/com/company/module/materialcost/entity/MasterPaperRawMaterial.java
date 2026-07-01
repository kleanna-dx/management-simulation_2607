package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 제지 원자재 마스터
 */
@Entity
@Table(name = "mc_master_paper_raw_materials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MasterPaperRawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PAPER_RAW_MATERIAL_ID")
    private Long paperRawMaterialId;

    @Column(name = "CATEGORY1", length = 50)
    private String category1;

    @Column(name = "MATERIAL_CLASS", nullable = false, length = 50)
    private String materialClass;

    @Column(name = "MATERIAL_SUBCLASS", nullable = false, length = 50)
    private String materialSubclass;

    @Column(name = "MATERIAL_CODE", nullable = false, length = 30)
    private String materialCode;

    @Column(name = "MATERIAL_NAME", nullable = false, length = 200)
    private String materialName;

    @Column(name = "MATERIAL_GROUP", nullable = false, length = 50)
    private String materialGroup;

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
    public MasterPaperRawMaterial(String category1, String materialClass,
                                  String materialSubclass, String materialCode,
                                  String materialName, String materialGroup) {
        this.category1 = category1;
        this.materialClass = materialClass;
        this.materialSubclass = materialSubclass;
        this.materialCode = materialCode;
        this.materialName = materialName;
        this.materialGroup = materialGroup;
    }

    public void update(String category1, String materialClass, String materialSubclass,
                       String materialCode, String materialName, String materialGroup) {
        this.category1 = category1;
        this.materialClass = materialClass;
        this.materialSubclass = materialSubclass;
        this.materialCode = materialCode;
        this.materialName = materialName;
        this.materialGroup = materialGroup;
    }
}
