package com.company.module.materialcost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 제외규칙 저장 Request DTO
 */
@Getter
@Setter
public class ExclusionRuleSaveRequest {

    @NotBlank(message = "호기코드는 필수입니다")
    private String machineCode;

    @NotBlank(message = "자재그룹 키워드는 필수입니다")
    private String materialGroupKeyword;

    @NotBlank(message = "제외 지종은 필수입니다")
    private String excludedProductType;

    private String description;
}
