package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 공통 원가 실적 레코드 (Phase 확장 대응)
 *
 * 모든 원가 유형(재료비/전력비/물류비/고정비)의 월별 실적이
 * 동일한 구조로 저장된다.
 *
 * Phase 1: cost_type = 'MATERIAL', driver_qty = 사용량(kg), unit_price = 단가(원/kg)
 * Phase 2: cost_type = 'ELECTRICITY', driver_qty = 가동시간(h), unit_price = 전력단가(원/kWh)
 * Phase 2: cost_type = 'LOGISTICS', driver_qty = 출하량(톤), unit_price = 운송단가(원/톤)
 * Phase 3: cost_type = 'LABOR', driver_qty = 투입인원, unit_price = 인건비/인
 * Phase 3: cost_type = 'DEPRECIATION', driver_qty = 1, unit_price = 월정액
 *
 * amount = driver_qty × unit_price (공통 계산식)
 * unit_consumption = driver_qty / production_qty (원단위)
 */
@Entity
@Table(name = "mc_cost_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CostRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COST_RECORD_ID")
    private Long costRecordId;

    @Column(name = "CALENDAR_YM", nullable = false, length = 6)
    private String calendarYm;

    @Column(name = "MACHINE_CODE", nullable = false, length = 20)
    private String machineCode;

    @Column(name = "COST_TYPE", nullable = false, length = 30)
    private String costType;

    @Column(name = "COST_CODE", nullable = false, length = 30)
    private String costCode;

    @Column(name = "COST_NAME", length = 100)
    private String costName;

    @Column(name = "PRODUCT_TYPE", length = 50)
    private String productType;

    @Column(name = "PRODUCTION_QTY")
    private Double productionQty;

    @Column(name = "DRIVER_QTY")
    private Double driverQty;

    @Column(name = "UNIT_PRICE")
    private Double unitPrice;

    @Column(name = "AMOUNT")
    private Double amount;

    @Column(name = "UNIT_CONSUMPTION")
    private Double unitConsumption;

    @Column(name = "PLAN_DRIVER_QTY")
    private Double planDriverQty;

    @Column(name = "PLAN_UNIT_PRICE")
    private Double planUnitPrice;

    @Column(name = "PLAN_AMOUNT")
    private Double planAmount;

    @Column(name = "QTY_EFFECT")
    private Double qtyEffect;

    @Column(name = "PRICE_EFFECT")
    private Double priceEffect;

    @Column(name = "DATA_SOURCE", length = 30)
    private String dataSource;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // 자동 계산
        if (this.driverQty != null && this.unitPrice != null && this.amount == null) {
            this.amount = this.driverQty * this.unitPrice;
        }
        if (this.driverQty != null && this.productionQty != null && this.productionQty > 0 && this.unitConsumption == null) {
            this.unitConsumption = this.driverQty / this.productionQty;
        }
    }

    @Builder
    public CostRecord(String calendarYm, String machineCode, String costType,
                      String costCode, String costName, String productType,
                      Double productionQty, Double driverQty, Double unitPrice,
                      Double amount, Double unitConsumption,
                      Double planDriverQty, Double planUnitPrice, Double planAmount,
                      Double qtyEffect, Double priceEffect, String dataSource) {
        this.calendarYm = calendarYm;
        this.machineCode = machineCode;
        this.costType = costType;
        this.costCode = costCode;
        this.costName = costName;
        this.productType = productType;
        this.productionQty = productionQty;
        this.driverQty = driverQty;
        this.unitPrice = unitPrice;
        this.amount = amount;
        this.unitConsumption = unitConsumption;
        this.planDriverQty = planDriverQty;
        this.planUnitPrice = planUnitPrice;
        this.planAmount = planAmount;
        this.qtyEffect = qtyEffect;
        this.priceEffect = priceEffect;
        this.dataSource = dataSource;
    }
}
