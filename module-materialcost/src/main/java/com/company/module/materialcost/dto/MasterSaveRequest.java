package com.company.module.materialcost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 마스터 데이터 저장 공통 Request DTO
 */
@Getter
@Setter
public class MasterSaveRequest {

    // Paper Product
    private String productHierarchyLevel3;
    private String gradeCode;
    private String gradeName;
    private String gradeDetail;

    // Paper Raw Material
    private String category1;
    private String materialClass;
    private String materialSubclass;

    // Common
    private String materialCode;
    private String materialName;
    private String materialGroup;

    // Tissue
    private String category;
    private String productName;
}
