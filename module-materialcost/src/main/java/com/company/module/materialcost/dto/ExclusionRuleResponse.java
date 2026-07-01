package com.company.module.materialcost.dto;

import com.company.module.materialcost.entity.ExclusionRule;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ExclusionRuleResponse {
    private Long exclusionRuleId;
    private String machineCode;
    private String materialGroupKeyword;
    private String excludedProductType;
    private String description;
    private LocalDateTime createdAt;

    public static ExclusionRuleResponse from(ExclusionRule entity) {
        return ExclusionRuleResponse.builder()
                .exclusionRuleId(entity.getExclusionRuleId())
                .machineCode(entity.getMachineCode())
                .materialGroupKeyword(entity.getMaterialGroupKeyword())
                .excludedProductType(entity.getExcludedProductType())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
