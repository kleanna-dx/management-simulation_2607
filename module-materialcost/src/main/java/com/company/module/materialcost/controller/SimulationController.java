package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.SimulationResponse;
import com.company.module.materialcost.dto.SimulationSaveRequest;
import com.company.module.materialcost.service.SimulationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 시뮬레이션 API
 */
@RestController
@RequestMapping("/materialcost-api/simulations")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    /**
     * 시뮬레이션 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SimulationResponse>>> getList() {
        return ResponseEntity.ok(ApiResponse.success(simulationService.getList()));
    }

    /**
     * 시뮬레이션 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SimulationResponse>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(simulationService.getDetail(id)));
    }

    /**
     * 시뮬레이션 저장
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SimulationResponse>> save(
            @Valid @RequestBody SimulationSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(simulationService.save(request)));
    }
}
