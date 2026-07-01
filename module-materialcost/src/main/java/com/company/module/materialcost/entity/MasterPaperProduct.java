package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 제지 제품 마스터
 */
@Entity
@Table(name = "mc_master_paper_products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MasterPaperProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PAPER_PRODUCT_ID")
    private Long paperProductId;

    @Column(name = "PRODUCT_HIERARCHY_LEVEL3", nullable = false, length = 20)
    private String productHierarchyLevel3;

    @Column(name = "GRADE_CODE", nullable = false, length = 30)
    private String gradeCode;

    @Column(name = "GRADE_NAME", nullable = false, length = 100)
    private String gradeName;

    @Column(name = "GRADE_DETAIL", length = 200)
    private String gradeDetail;

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
    public MasterPaperProduct(String productHierarchyLevel3, String gradeCode,
                              String gradeName, String gradeDetail) {
        this.productHierarchyLevel3 = productHierarchyLevel3;
        this.gradeCode = gradeCode;
        this.gradeName = gradeName;
        this.gradeDetail = gradeDetail;
    }

    public void update(String productHierarchyLevel3, String gradeCode,
                       String gradeName, String gradeDetail) {
        this.productHierarchyLevel3 = productHierarchyLevel3;
        this.gradeCode = gradeCode;
        this.gradeName = gradeName;
        this.gradeDetail = gradeDetail;
    }
}
