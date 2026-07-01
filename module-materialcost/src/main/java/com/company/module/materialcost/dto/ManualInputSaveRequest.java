package com.company.module.materialcost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 수기입력 저장 Request DTO
 */
@Getter
@Setter
public class ManualInputSaveRequest {

    @NotBlank(message = "년월(ym)은 필수입니다")
    private String ym;

    @NotBlank(message = "호기(machine)는 필수입니다")
    private String machine;

    private String deptType;

    @NotBlank(message = "데이터(data)는 필수입니다")
    private String data;

    private String savedBy;
}
