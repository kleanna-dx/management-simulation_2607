package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.ManualInputResponse;
import com.company.module.materialcost.dto.ManualInputSaveRequest;
import com.company.module.materialcost.service.ManualInputService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 부서별 수기입력 API
 */
@RestController
@RequestMapping("/materialcost-api/manual-input")
@RequiredArgsConstructor
public class ManualInputController {

    private final ManualInputService manualInputService;

    /**
     * 최신 저장 데이터 조회
     */
    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<ManualInputResponse>> getSaved(
            @RequestParam String ym,
            @RequestParam String machine) {
        return manualInputService.getLatest(ym, machine)
                .map(data -> ResponseEntity.ok(ApiResponse.success(data)))
                .orElse(ResponseEntity.ok(ApiResponse.success(null)));
    }

    /**
     * 수기입력 저장 (부서별 merge)
     */
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<ManualInputResponse>> save(
            @Valid @RequestBody ManualInputSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(manualInputService.save(request)));
    }

    /**
     * 히스토리 조회
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ManualInputResponse>>> getHistory(
            @RequestParam String ym,
            @RequestParam String machine) {
        return ResponseEntity.ok(ApiResponse.success(manualInputService.getHistory(ym, machine)));
    }
}
