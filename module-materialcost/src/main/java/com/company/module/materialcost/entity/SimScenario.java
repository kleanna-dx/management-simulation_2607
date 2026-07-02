package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 시뮬레이션 시나리오 (Phase 확장 대응)
 *
 * 기존 Simulation은 단일 JSON blob이었으나,
 * 확장 구조에서는 시나리오별로 원가 항목을 플러그인 방식으로 조합한다.
 *
 * SimScenario (시나리오 헤더)
 *   └─ mc_sim_scenario_items (시나리오별 원가 항목 설정, JSON)
 *
 * 시뮬레이션 실행 흐름:
 *   1. 시나리오 생성 (생산량 Fix)
 *   2. cost_type별 계산 엔진 실행 (플러그인)
 *   3. 결과 합산 → 영업이익 도출
 */
@Entity
@Table(name = "mc_sim_scenarios")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SimScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SCENARIO_ID")
    private Long scenarioId;

    @Column(name = "SCENARIO_NAME", nullable = false, length = 200)
    private String scenarioName;

    @Column(name = "BASE_YM", nullable = false, length = 6)
    private String baseYm;

    @Column(name = "MACHINE_CODE", nullable = false, length = 20)
    private String machineCode;

    @Column(name = "PRODUCTION_QTY_TON", nullable = false)
    private Double productionQtyTon;

    @Column(name = "REVENUE_AMOUNT")
    private Double revenueAmount;

    @Column(name = "COST_TYPES_INCLUDED", length = 200)
    private String costTypesIncluded;

    @Column(name = "SCENARIO_PARAMS", columnDefinition = "LONGTEXT")
    private String scenarioParams;

    @Column(name = "RESULT_SUMMARY", columnDefinition = "LONGTEXT")
    private String resultSummary;

    @Column(name = "OPERATING_PROFIT")
    private Double operatingProfit;

    @Column(name = "STATUS", length = 20)
    private String status;

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "DRAFT";
        if (this.costTypesIncluded == null) this.costTypesIncluded = "MATERIAL";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public SimScenario(String scenarioName, String baseYm, String machineCode,
                       Double productionQtyTon, Double revenueAmount,
                       String costTypesIncluded, String scenarioParams,
                       String resultSummary, Double operatingProfit,
                       String status, String createdBy) {
        this.scenarioName = scenarioName;
        this.baseYm = baseYm;
        this.machineCode = machineCode;
        this.productionQtyTon = productionQtyTon;
        this.revenueAmount = revenueAmount;
        this.costTypesIncluded = costTypesIncluded;
        this.scenarioParams = scenarioParams;
        this.resultSummary = resultSummary;
        this.operatingProfit = operatingProfit;
        this.status = status;
        this.createdBy = createdBy;
    }

    public void updateResult(String resultSummary, Double operatingProfit) {
        this.resultSummary = resultSummary;
        this.operatingProfit = operatingProfit;
        this.status = "COMPLETED";
    }
}
