package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 원가 항목 마스터 (Phase 확장 대응)
 *
 * 모든 원가 유형을 하나의 메타 테이블로 관리한다.
 * Phase 2~4 추가 시 이 테이블에 INSERT만 하면 된다.
 *
 * cost_type 구분:
 *   - MATERIAL : 원부재료비 (Phase 1)
 *   - ELECTRICITY : 전력비 (Phase 2)
 *   - LOGISTICS : 물류비 (Phase 2)
 *   - LABOR : 노무비 (Phase 3)
 *   - DEPRECIATION : 감가상각 (Phase 3)
 *   - MAINTENANCE : 수선유지비 (Phase 3)
 *   - CONSUMABLE : 소모품 (Phase 3)
 *   - SELLING : 판관비 (Phase 4)
 *
 * cost_behavior 구분:
 *   - VARIABLE : 변동비 (생산량에 비례)
 *   - FIXED : 고정비 (가동률에 따른 흡수)
 *   - SEMI_VARIABLE : 준변동비
 */
@Entity
@Table(name = "mc_cost_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COST_ITEM_ID")
    private Long costItemId;

    @Column(name = "COST_TYPE", nullable = false, length = 30)
    private String costType;

    @Column(name = "COST_CODE", nullable = false, length = 30)
    private String costCode;

    @Column(name = "COST_NAME", nullable = false, length = 100)
    private String costName;

    @Column(name = "COST_BEHAVIOR", nullable = false, length = 20)
    private String costBehavior;

    @Column(name = "UNIT_OF_MEASURE", length = 20)
    private String unitOfMeasure;

    @Column(name = "PHASE", nullable = false)
    private Integer phase;

    @Column(name = "ALLOC_BASIS", length = 50)
    private String allocBasis;

    @Column(name = "CALC_FORMULA", length = 500)
    private String calcFormula;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean isActive;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isActive == null) this.isActive = true;
        if (this.sortOrder == null) this.sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public CostItem(String costType, String costCode, String costName,
                    String costBehavior, String unitOfMeasure, Integer phase,
                    String allocBasis, String calcFormula, Integer sortOrder,
                    Boolean isActive, String description) {
        this.costType = costType;
        this.costCode = costCode;
        this.costName = costName;
        this.costBehavior = costBehavior;
        this.unitOfMeasure = unitOfMeasure;
        this.phase = phase;
        this.allocBasis = allocBasis;
        this.calcFormula = calcFormula;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.description = description;
    }

    public void update(String costName, String costBehavior, String unitOfMeasure,
                       String allocBasis, String calcFormula, Integer sortOrder,
                       Boolean isActive, String description) {
        this.costName = costName;
        this.costBehavior = costBehavior;
        this.unitOfMeasure = unitOfMeasure;
        this.allocBasis = allocBasis;
        this.calcFormula = calcFormula;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
        this.description = description;
    }
}
