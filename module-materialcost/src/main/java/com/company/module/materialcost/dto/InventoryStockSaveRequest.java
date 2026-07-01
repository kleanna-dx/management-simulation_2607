package com.company.module.materialcost.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 재고 입출고 저장 Request DTO
 */
@Getter
@Setter
public class InventoryStockSaveRequest {

    @NotBlank(message = "월(month)은 필수입니다")
    private String month;

    private String plant;
    private String materialGroup;
    private String materialType;
    private String materialTypeName;
    private String materialId;
    private String materialName;
    private String currency;
    private String unit;
    private Double stockQty;
    private Double stockPrice;
    private Double incomingQty;
    private Double incomingPrice;
    private Double outgoingQty;
    private Double outgoingPrice;
    private Double closingQty;
    private Double closingPrice;
}
