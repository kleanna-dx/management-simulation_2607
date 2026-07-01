package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.InventoryStockResponse;
import com.company.module.materialcost.dto.InventoryStockSaveRequest;
import com.company.module.materialcost.service.InventoryStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 재고 입출고 API
 */
@RestController
@RequestMapping("/materialcost-api/inventory-stock")
@RequiredArgsConstructor
public class InventoryStockController {

    private final InventoryStockService inventoryStockService;

    /**
     * 재고 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryStockResponse>>> getList(
            @RequestParam String month,
            @RequestParam(required = false) String plant,
            @RequestParam(required = false) String materialGroup) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryStockService.getList(month, plant, materialGroup)));
    }

    /**
     * 기말재고 맵 (수기입력 기초재고 참조용)
     */
    @GetMapping("/closing-map")
    public ResponseEntity<ApiResponse<Map<String, Map<String, Double>>>> getClosingMap(
            @RequestParam String month,
            @RequestParam String plant) {
        return ResponseEntity.ok(ApiResponse.success(
                inventoryStockService.getClosingMap(month, plant)));
    }

    /**
     * 단건 저장
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InventoryStockResponse>> save(
            @Valid @RequestBody InventoryStockSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(inventoryStockService.save(request)));
    }

    /**
     * 벌크 저장
     */
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveBulk(
            @RequestBody List<InventoryStockSaveRequest> requests) {
        int count = inventoryStockService.saveBulk(requests);
        return ResponseEntity.ok(ApiResponse.created(Map.of("inserted", count)));
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        inventoryStockService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
