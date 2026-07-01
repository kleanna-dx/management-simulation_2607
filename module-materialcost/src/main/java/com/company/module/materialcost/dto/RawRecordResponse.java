package com.company.module.materialcost.dto;

import com.company.module.materialcost.entity.RawRecord;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RawRecordResponse {
    private Long rawRecordId;
    private String calendarYm;
    private String machineCode;
    private String machineName;
    private String materialCode;
    private String materialName;
    private String materialGroupName;
    private String materialGroupMajor;
    private String materialGroupMajorName;
    private String productTypeName;
    private Double totalProduction;
    private Double actualUnitConsumption;
    private Double actualUnitPrice;
    private Double issueQty;
    private Double issueAmount;
    private Double planVsUsageDiff;
    private Double planVsPriceDiff;
    private String dataSource;
    private LocalDateTime createdAt;

    public static RawRecordResponse from(RawRecord entity) {
        return RawRecordResponse.builder()
                .rawRecordId(entity.getRawRecordId())
                .calendarYm(entity.getCalendarYm())
                .machineCode(entity.getMachineCode())
                .machineName(entity.getMachineName())
                .materialCode(entity.getMaterialCode())
                .materialName(entity.getMaterialName())
                .materialGroupName(entity.getMaterialGroupName())
                .materialGroupMajor(entity.getMaterialGroupMajor())
                .materialGroupMajorName(entity.getMaterialGroupMajorName())
                .productTypeName(entity.getProductTypeName())
                .totalProduction(entity.getTotalProduction())
                .actualUnitConsumption(entity.getActualUnitConsumption())
                .actualUnitPrice(entity.getActualUnitPrice())
                .issueQty(entity.getIssueQty())
                .issueAmount(entity.getIssueAmount())
                .planVsUsageDiff(entity.getPlanVsUsageDiff())
                .planVsPriceDiff(entity.getPlanVsPriceDiff())
                .dataSource(entity.getDataSource())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
