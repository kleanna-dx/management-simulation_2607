package com.company.module.materialcost.controller;

import com.company.core.common.response.ApiResponse;
import com.company.module.materialcost.dto.MasterSaveRequest;
import com.company.module.materialcost.entity.*;
import com.company.module.materialcost.service.MasterDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 기준정보(마스터) 관리 API
 */
@RestController
@RequestMapping("/materialcost-api/master")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    // ========== Paper Products ==========
    @GetMapping("/paper-products")
    public ResponseEntity<ApiResponse<List<MasterPaperProduct>>> getPaperProducts() {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.getPaperProducts()));
    }

    @PostMapping("/paper-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperProduct>> savePaperProduct(
            @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(masterDataService.savePaperProduct(request)));
    }

    @PutMapping("/paper-products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperProduct>> updatePaperProduct(
            @PathVariable Long id, @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.updatePaperProduct(id, request)));
    }

    @DeleteMapping("/paper-products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePaperProduct(@PathVariable Long id) {
        masterDataService.deletePaperProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/paper-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllPaperProducts() {
        masterDataService.deleteAllPaperProducts();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== Paper Raw Materials ==========
    @GetMapping("/paper-raw")
    public ResponseEntity<ApiResponse<List<MasterPaperRawMaterial>>> getPaperRaw() {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.getPaperRawMaterials()));
    }

    @PostMapping("/paper-raw")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperRawMaterial>> savePaperRaw(
            @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(masterDataService.savePaperRaw(request)));
    }

    @PutMapping("/paper-raw/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperRawMaterial>> updatePaperRaw(
            @PathVariable Long id, @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.updatePaperRaw(id, request)));
    }

    @DeleteMapping("/paper-raw/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePaperRaw(@PathVariable Long id) {
        masterDataService.deletePaperRaw(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/paper-raw")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllPaperRaw() {
        masterDataService.deleteAllPaperRaw();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== Paper Sub Materials ==========
    @GetMapping("/paper-sub")
    public ResponseEntity<ApiResponse<List<MasterPaperSubMaterial>>> getPaperSub() {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.getPaperSubMaterials()));
    }

    @PostMapping("/paper-sub")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperSubMaterial>> savePaperSub(
            @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(masterDataService.savePaperSub(request)));
    }

    @PutMapping("/paper-sub/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterPaperSubMaterial>> updatePaperSub(
            @PathVariable Long id, @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.updatePaperSub(id, request)));
    }

    @DeleteMapping("/paper-sub/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePaperSub(@PathVariable Long id) {
        masterDataService.deletePaperSub(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/paper-sub")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllPaperSub() {
        masterDataService.deleteAllPaperSub();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== Tissue Products ==========
    @GetMapping("/tissue-products")
    public ResponseEntity<ApiResponse<List<MasterTissueProduct>>> getTissueProducts() {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.getTissueProducts()));
    }

    @PostMapping("/tissue-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterTissueProduct>> saveTissueProduct(
            @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(masterDataService.saveTissueProduct(request)));
    }

    @PutMapping("/tissue-products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterTissueProduct>> updateTissueProduct(
            @PathVariable Long id, @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.updateTissueProduct(id, request)));
    }

    @DeleteMapping("/tissue-products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTissueProduct(@PathVariable Long id) {
        masterDataService.deleteTissueProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/tissue-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllTissueProducts() {
        masterDataService.deleteAllTissueProducts();
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== Tissue Raw Materials ==========
    @GetMapping("/tissue-raw")
    public ResponseEntity<ApiResponse<List<MasterTissueRawMaterial>>> getTissueRaw() {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.getTissueRawMaterials()));
    }

    @PostMapping("/tissue-raw")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterTissueRawMaterial>> saveTissueRaw(
            @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.created(masterDataService.saveTissueRaw(request)));
    }

    @PutMapping("/tissue-raw/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MasterTissueRawMaterial>> updateTissueRaw(
            @PathVariable Long id, @Valid @RequestBody MasterSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.success(masterDataService.updateTissueRaw(id, request)));
    }

    @DeleteMapping("/tissue-raw/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTissueRaw(@PathVariable Long id) {
        masterDataService.deleteTissueRaw(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/tissue-raw")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllTissueRaw() {
        masterDataService.deleteAllTissueRaw();
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
