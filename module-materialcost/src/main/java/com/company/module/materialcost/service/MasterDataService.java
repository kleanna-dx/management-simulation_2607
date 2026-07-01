package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.MasterSaveRequest;
import com.company.module.materialcost.entity.*;
import com.company.module.materialcost.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MasterDataService {

    private final MasterPaperProductRepository paperProductRepo;
    private final MasterPaperRawMaterialRepository paperRawRepo;
    private final MasterPaperSubMaterialRepository paperSubRepo;
    private final MasterTissueProductRepository tissueProductRepo;
    private final MasterTissueRawMaterialRepository tissueRawRepo;

    // ========== Paper Products ==========
    public List<MasterPaperProduct> getPaperProducts() {
        return paperProductRepo.findAllByOrderByGradeCodeAsc();
    }

    @Transactional
    public MasterPaperProduct savePaperProduct(MasterSaveRequest req) {
        return paperProductRepo.save(MasterPaperProduct.builder()
                .productHierarchyLevel3(req.getProductHierarchyLevel3())
                .gradeCode(req.getGradeCode())
                .gradeName(req.getGradeName())
                .gradeDetail(req.getGradeDetail())
                .build());
    }

    @Transactional
    public MasterPaperProduct updatePaperProduct(Long id, MasterSaveRequest req) {
        MasterPaperProduct entity = paperProductRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("제품 마스터를 찾을 수 없습니다: " + id));
        entity.update(req.getProductHierarchyLevel3(), req.getGradeCode(),
                req.getGradeName(), req.getGradeDetail());
        return entity;
    }

    @Transactional
    public void deletePaperProduct(Long id) {
        paperProductRepo.deleteById(id);
    }

    @Transactional
    public void deleteAllPaperProducts() {
        paperProductRepo.deleteAll();
    }

    // ========== Paper Raw Materials ==========
    public List<MasterPaperRawMaterial> getPaperRawMaterials() {
        return paperRawRepo.findAllByOrderByMaterialGroupAsc();
    }

    @Transactional
    public MasterPaperRawMaterial savePaperRaw(MasterSaveRequest req) {
        return paperRawRepo.save(MasterPaperRawMaterial.builder()
                .category1(req.getCategory1())
                .materialClass(req.getMaterialClass())
                .materialSubclass(req.getMaterialSubclass())
                .materialCode(req.getMaterialCode())
                .materialName(req.getMaterialName())
                .materialGroup(req.getMaterialGroup())
                .build());
    }

    @Transactional
    public MasterPaperRawMaterial updatePaperRaw(Long id, MasterSaveRequest req) {
        MasterPaperRawMaterial entity = paperRawRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("원자재 마스터를 찾을 수 없습니다: " + id));
        entity.update(req.getCategory1(), req.getMaterialClass(), req.getMaterialSubclass(),
                req.getMaterialCode(), req.getMaterialName(), req.getMaterialGroup());
        return entity;
    }

    @Transactional
    public void deletePaperRaw(Long id) {
        paperRawRepo.deleteById(id);
    }

    @Transactional
    public void deleteAllPaperRaw() {
        paperRawRepo.deleteAll();
    }

    // ========== Paper Sub Materials ==========
    public List<MasterPaperSubMaterial> getPaperSubMaterials() {
        return paperSubRepo.findAllByOrderByMaterialGroupAsc();
    }

    @Transactional
    public MasterPaperSubMaterial savePaperSub(MasterSaveRequest req) {
        return paperSubRepo.save(MasterPaperSubMaterial.builder()
                .materialCode(req.getMaterialCode())
                .materialName(req.getMaterialName())
                .materialGroup(req.getMaterialGroup())
                .build());
    }

    @Transactional
    public MasterPaperSubMaterial updatePaperSub(Long id, MasterSaveRequest req) {
        MasterPaperSubMaterial entity = paperSubRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("부자재 마스터를 찾을 수 없습니다: " + id));
        entity.update(req.getMaterialCode(), req.getMaterialName(), req.getMaterialGroup());
        return entity;
    }

    @Transactional
    public void deletePaperSub(Long id) {
        paperSubRepo.deleteById(id);
    }

    @Transactional
    public void deleteAllPaperSub() {
        paperSubRepo.deleteAll();
    }

    // ========== Tissue Products ==========
    public List<MasterTissueProduct> getTissueProducts() {
        return tissueProductRepo.findAllByOrderByCategoryAsc();
    }

    @Transactional
    public MasterTissueProduct saveTissueProduct(MasterSaveRequest req) {
        return tissueProductRepo.save(MasterTissueProduct.builder()
                .category(req.getCategory())
                .productName(req.getProductName())
                .build());
    }

    @Transactional
    public MasterTissueProduct updateTissueProduct(Long id, MasterSaveRequest req) {
        MasterTissueProduct entity = tissueProductRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("화장지 제품 마스터를 찾을 수 없습니다: " + id));
        entity.update(req.getCategory(), req.getProductName());
        return entity;
    }

    @Transactional
    public void deleteTissueProduct(Long id) {
        tissueProductRepo.deleteById(id);
    }

    @Transactional
    public void deleteAllTissueProducts() {
        tissueProductRepo.deleteAll();
    }

    // ========== Tissue Raw Materials ==========
    public List<MasterTissueRawMaterial> getTissueRawMaterials() {
        return tissueRawRepo.findAllByOrderByCategoryAsc();
    }

    @Transactional
    public MasterTissueRawMaterial saveTissueRaw(MasterSaveRequest req) {
        return tissueRawRepo.save(MasterTissueRawMaterial.builder()
                .category(req.getCategory())
                .materialCode(req.getMaterialCode())
                .materialName(req.getMaterialName())
                .build());
    }

    @Transactional
    public MasterTissueRawMaterial updateTissueRaw(Long id, MasterSaveRequest req) {
        MasterTissueRawMaterial entity = tissueRawRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("화장지 원자재 마스터를 찾을 수 없습니다: " + id));
        entity.update(req.getCategory(), req.getMaterialCode(), req.getMaterialName());
        return entity;
    }

    @Transactional
    public void deleteTissueRaw(Long id) {
        tissueRawRepo.deleteById(id);
    }

    @Transactional
    public void deleteAllTissueRaw() {
        tissueRawRepo.deleteAll();
    }
}
