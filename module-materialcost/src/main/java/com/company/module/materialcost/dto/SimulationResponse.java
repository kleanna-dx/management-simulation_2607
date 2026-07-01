package com.company.module.materialcost.dto;

import com.company.module.materialcost.entity.Simulation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SimulationResponse {
    private Long simulationId;
    private String simName;
    private Integer baseYear;
    private Integer baseMonth;
    private String simData;
    private String resultData;
    private String createdBy;
    private LocalDateTime createdAt;

    public static SimulationResponse from(Simulation entity) {
        return SimulationResponse.builder()
                .simulationId(entity.getSimulationId())
                .simName(entity.getSimName())
                .baseYear(entity.getBaseYear())
                .baseMonth(entity.getBaseMonth())
                .simData(entity.getSimData())
                .resultData(entity.getResultData())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static SimulationResponse listItem(Simulation entity) {
        return SimulationResponse.builder()
                .simulationId(entity.getSimulationId())
                .simName(entity.getSimName())
                .baseYear(entity.getBaseYear())
                .baseMonth(entity.getBaseMonth())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
