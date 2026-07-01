package com.company.module.materialcost.dto;

import com.company.module.materialcost.entity.InventoryStock;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryStockResponse {
    private Long inventoryStockId;
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
    private LocalDateTime createdAt;

    public static InventoryStockResponse from(InventoryStock entity) {
        return InventoryStockResponse.builder()
                .inventoryStockId(entity.getInventoryStockId())
                .month(entity.getMonth())
                .plant(entity.getPlant())
                .materialGroup(entity.getMaterialGroup())
                .materialType(entity.getMaterialType())
                .materialTypeName(entity.getMaterialTypeName())
                .materialId(entity.getMaterialId())
                .materialName(entity.getMaterialName())
                .currency(entity.getCurrency())
                .unit(entity.getUnit())
                .stockQty(entity.getStockQty())
                .stockPrice(entity.getStockPrice())
                .incomingQty(entity.getIncomingQty())
                .incomingPrice(entity.getIncomingPrice())
                .outgoingQty(entity.getOutgoingQty())
                .outgoingPrice(entity.getOutgoingPrice())
                .closingQty(entity.getClosingQty())
                .closingPrice(entity.getClosingPrice())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
