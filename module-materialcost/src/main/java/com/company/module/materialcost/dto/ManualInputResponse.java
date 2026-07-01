package com.company.module.materialcost.dto;

import com.company.module.materialcost.entity.ManualInput;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ManualInputResponse {
    private Long manualInputId;
    private String ym;
    private String machineCode;
    private String deptType;
    private String data;
    private String savedBy;
    private LocalDateTime updatedAt;

    public static ManualInputResponse from(ManualInput entity) {
        return ManualInputResponse.builder()
                .manualInputId(entity.getManualInputId())
                .ym(entity.getYm())
                .machineCode(entity.getMachineCode())
                .deptType(entity.getDeptType())
                .data(entity.getData())
                .savedBy(entity.getSavedBy())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
