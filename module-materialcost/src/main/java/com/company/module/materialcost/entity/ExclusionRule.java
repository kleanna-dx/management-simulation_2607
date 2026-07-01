package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 원단위 계산 제외규칙
 */
@Entity
@Table(name = "mc_exclusion_rules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExclusionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EXCLUSION_RULE_ID")
    private Long exclusionRuleId;

    @Column(name = "MACHINE_CODE", nullable = false, length = 20)
    private String machineCode;

    @Column(name = "MATERIAL_GROUP_KEYWORD", nullable = false, length = 100)
    private String materialGroupKeyword;

    @Column(name = "EXCLUDED_PRODUCT_TYPE", nullable = false, length = 50)
    private String excludedProductType;

    @Column(name = "DESCRIPTION", length = 300)
    private String description;

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
    public ExclusionRule(String machineCode, String materialGroupKeyword,
                         String excludedProductType, String description) {
        this.machineCode = machineCode;
        this.materialGroupKeyword = materialGroupKeyword;
        this.excludedProductType = excludedProductType;
        this.description = description;
    }

    public void update(String machineCode, String materialGroupKeyword,
                       String excludedProductType, String description) {
        this.machineCode = machineCode;
        this.materialGroupKeyword = materialGroupKeyword;
        this.excludedProductType = excludedProductType;
        this.description = description;
    }
}
