package com.company.module.materialcost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 시뮬레이션 저장 데이터
 */
@Entity
@Table(name = "mc_simulations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Simulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SIMULATION_ID")
    private Long simulationId;

    @Column(name = "SIM_NAME", nullable = false, length = 200)
    private String simName;

    @Column(name = "BASE_YEAR", nullable = false)
    private Integer baseYear;

    @Column(name = "BASE_MONTH", nullable = false)
    private Integer baseMonth;

    @Column(name = "SIM_DATA", nullable = false, columnDefinition = "LONGTEXT")
    private String simData;

    @Column(name = "RESULT_DATA", columnDefinition = "LONGTEXT")
    private String resultData;

    @Column(name = "CREATED_BY", length = 100)
    private String createdBy;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.createdBy == null) this.createdBy = "admin";
    }

    @Builder
    public Simulation(String simName, Integer baseYear, Integer baseMonth,
                      String simData, String resultData, String createdBy) {
        this.simName = simName;
        this.baseYear = baseYear;
        this.baseMonth = baseMonth;
        this.simData = simData;
        this.resultData = resultData;
        this.createdBy = createdBy;
    }
}
