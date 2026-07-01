package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 부서별 수기입력 데이터 (생산/구매 merge 방식)
 */
@Entity
@Table(name = "mc_manual_inputs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ManualInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MANUAL_INPUT_ID")
    private Long manualInputId;

    @Column(name = "YM", nullable = false, length = 6)
    private String ym;

    @Column(name = "MACHINE_CODE", nullable = false, length = 20)
    private String machineCode;

    @Column(name = "DEPT_TYPE", length = 20)
    private String deptType;

    @Column(name = "DATA", nullable = false, columnDefinition = "LONGTEXT")
    private String data;

    @Column(name = "SAVED_BY", length = 100)
    private String savedBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.deptType == null) this.deptType = "all";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Builder
    public ManualInput(String ym, String machineCode, String deptType,
                       String data, String savedBy) {
        this.ym = ym;
        this.machineCode = machineCode;
        this.deptType = deptType;
        this.data = data;
        this.savedBy = savedBy;
    }

    public void updateData(String data, String savedBy, String deptType) {
        this.data = data;
        this.savedBy = savedBy;
        this.deptType = deptType;
    }
}
