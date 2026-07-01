package com.company.module.materialcost.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 시뮬레이션 저장 Request DTO
 */
@Getter
@Setter
public class SimulationSaveRequest {

    @NotBlank(message = "시뮬레이션 이름은 필수입니다")
    private String simName;

    @NotNull(message = "기준연도는 필수입니다")
    private Integer baseYear;

    @NotNull(message = "기준월은 필수입니다")
    private Integer baseMonth;

    @NotBlank(message = "시뮬레이션 데이터는 필수입니다")
    private String simData;

    private String resultData;
    private String createdBy;
}
