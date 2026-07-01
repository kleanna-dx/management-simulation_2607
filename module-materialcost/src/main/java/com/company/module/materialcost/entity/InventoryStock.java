package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 재고 입출고 데이터
 */
@Entity
@Table(name = "mc_inventory_stock")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InventoryStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INVENTORY_STOCK_ID")
    private Long inventoryStockId;

    @Column(name = "MONTH", nullable = false, length = 6)
    private String month;

    @Column(name = "PLANT", length = 20)
    private String plant;

    @Column(name = "MATERIAL_GROUP", length = 50)
    private String materialGroup;

    @Column(name = "MATERIAL_TYPE", length = 20)
    private String materialType;

    @Column(name = "MATERIAL_TYPE_NAME", length = 100)
    private String materialTypeName;

    @Column(name = "MATERIAL_ID", length = 30)
    private String materialId;

    @Column(name = "MATERIAL_NAME", length = 200)
    private String materialName;

    @Column(name = "CURRENCY", length = 10)
    private String currency;

    @Column(name = "UNIT", length = 10)
    private String unit;

    @Column(name = "STOCK_QTY")
    private Double stockQty;

    @Column(name = "STOCK_PRICE")
    private Double stockPrice;

    @Column(name = "INCOMING_QTY")
    private Double incomingQty;

    @Column(name = "INCOMING_PRICE")
    private Double incomingPrice;

    @Column(name = "OUTGOING_QTY")
    private Double outgoingQty;

    @Column(name = "OUTGOING_PRICE")
    private Double outgoingPrice;

    @Column(name = "CLOSING_QTY")
    private Double closingQty;

    @Column(name = "CLOSING_PRICE")
    private Double closingPrice;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "KRW";
        if (this.unit == null) this.unit = "KG";
    }

    @Builder
    public InventoryStock(String month, String plant, String materialGroup,
                          String materialType, String materialTypeName,
                          String materialId, String materialName,
                          String currency, String unit,
                          Double stockQty, Double stockPrice,
                          Double incomingQty, Double incomingPrice,
                          Double outgoingQty, Double outgoingPrice,
                          Double closingQty, Double closingPrice) {
        this.month = month;
        this.plant = plant;
        this.materialGroup = materialGroup;
        this.materialType = materialType;
        this.materialTypeName = materialTypeName;
        this.materialId = materialId;
        this.materialName = materialName;
        this.currency = currency;
        this.unit = unit;
        this.stockQty = stockQty;
        this.stockPrice = stockPrice;
        this.incomingQty = incomingQty;
        this.incomingPrice = incomingPrice;
        this.outgoingQty = outgoingQty;
        this.outgoingPrice = outgoingPrice;
        this.closingQty = closingQty;
        this.closingPrice = closingPrice;
    }
}
