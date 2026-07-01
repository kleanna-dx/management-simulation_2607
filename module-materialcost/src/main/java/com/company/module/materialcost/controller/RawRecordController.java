package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.RawRecordResponse;
import com.company.module.materialcost.service.RawRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 원부자재 실적 데이터 API
 */
@RestController
@RequestMapping("/materialcost-api/raw-records")
@RequiredArgsConstructor
public class RawRecordController {

    private final RawRecordService rawRecordService;

    /**
     * 실적 데이터 검색 (페이징)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RawRecordResponse>>> getList(
            @RequestParam(required = false) String ym,
            @RequestParam(required = false) String machine,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                rawRecordService.searchRecords(ym, machine, search, page, size)));
    }

    /**
     * 사용 가능한 월 목록
     */
    @GetMapping("/available-months")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableMonths() {
        return ResponseEntity.ok(ApiResponse.success(rawRecordService.getAvailableMonths()));
    }

    /**
     * 특정 월의 호기 목록
     */
    @GetMapping("/machines")
    public ResponseEntity<ApiResponse<List<String>>> getMachines(@RequestParam String ym) {
        return ResponseEntity.ok(ApiResponse.success(rawRecordService.getMachinesByMonth(ym)));
    }

    /**
     * 자재그룹별 요약 (대시보드)
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSummary(
            @RequestParam String ym,
            @RequestParam(required = false) String machine) {
        return ResponseEntity.ok(ApiResponse.success(rawRecordService.getSummaryByGroup(ym, machine)));
    }

    /**
     * 호기별·지종별 생산량
     */
    @GetMapping("/production")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProduction(@RequestParam String ym) {
        return ResponseEntity.ok(ApiResponse.success(rawRecordService.getProductionByMachineAndType(ym)));
    }

    /**
     * 호기별 자재 상세
     */
    @GetMapping("/material-detail")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMaterialDetail(
            @RequestParam String ym,
            @RequestParam String machine) {
        return ResponseEntity.ok(ApiResponse.success(rawRecordService.getMaterialDetailByMachine(ym, machine)));
    }

    /**
     * 특정 월+호기 데이터 삭제
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteByCondition(
            @RequestParam String ym,
            @RequestParam String machine) {
        int deleted = rawRecordService.deleteByYmAndMachine(ym, machine);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", deleted)));
    }
}
