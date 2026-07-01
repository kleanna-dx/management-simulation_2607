package com.company.module.materialcost.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * 대시보드 종합 분석 Response DTO
 */
@Getter
@Builder
public class DashboardOverviewResponse {
    private String calendarYm;
    private String machineCode;
    private Double totalIssueQty;
    private Double totalIssueAmount;
    private Integer materialCount;
    private Double unitConsumption;
    private Double prevMonthDiff;
    private Map<String, Object> groupSummary;
}
