package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.ExclusionRuleResponse;
import com.company.module.materialcost.dto.ExclusionRuleSaveRequest;
import com.company.module.materialcost.service.ExclusionRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 원단위 제외규칙 API
 */
@RestController
@RequestMapping("/materialcost-api/exclusion-rules")
@RequiredArgsConstructor
public class ExclusionRuleController {

    private final ExclusionRuleService exclusionRuleService;

    /**
     * 호기별 제외규칙 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExclusionRuleResponse>>> getByMachine(
            @RequestParam String machine) {
        return ResponseEntity.ok(ApiResponse.success(exclusionRuleService.getByMachine(machine)));
    }

    /**
     * 제외규칙 저장
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExclusionRuleResponse>> save(
            @Valid @RequestBody ExclusionRuleSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(exclusionRuleService.save(request)));
    }

    /**
     * 제외규칙 수정
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExclusionRuleResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ExclusionRuleSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(exclusionRuleService.update(id, request)));
    }

    /**
     * 제외규칙 삭제
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        exclusionRuleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
