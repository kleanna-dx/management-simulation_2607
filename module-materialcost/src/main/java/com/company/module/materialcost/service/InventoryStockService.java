package com.company.module.materialcost.service;

import com.company.module.materialcost.dto.InventoryStockResponse;
import com.company.module.materialcost.dto.InventoryStockSaveRequest;
import com.company.module.materialcost.entity.InventoryStock;
import com.company.module.materialcost.repository.InventoryStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryStockService {

    private final InventoryStockRepository inventoryStockRepository;

    /**
     * 재고 목록 조회
     */
    public List<InventoryStockResponse> getList(String month, String plant, String materialGroup) {
        List<InventoryStock> stocks = inventoryStockRepository.findByConditions(month, plant, materialGroup);
        return stocks.stream().map(InventoryStockResponse::from).collect(Collectors.toList());
    }

    /**
     * 기말재고 맵 조회 (material_id → { closing_qty, closing_price })
     */
    public Map<String, Map<String, Double>> getClosingMap(String month, String plant) {
        List<Object[]> results = inventoryStockRepository.findClosingMapByMonthAndPlant(month, plant);
        Map<String, Map<String, Double>> map = new HashMap<>();
        for (Object[] row : results) {
            String materialId = row[0] != null ? row[0].toString() : "";
            Map<String, Double> vals = new HashMap<>();
            vals.put("closingQty", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            vals.put("closingPrice", row[2] != null ? ((Number) row[2]).doubleValue() : 0.0);
            map.put(materialId, vals);
        }
        return map;
    }

    /**
     * 재고 단건 저장
     */
    @Transactional
    public InventoryStockResponse save(InventoryStockSaveRequest request) {
        InventoryStock entity = InventoryStock.builder()
                .month(request.getMonth())
                .plant(request.getPlant())
                .materialGroup(request.getMaterialGroup())
                .materialType(request.getMaterialType())
                .materialTypeName(request.getMaterialTypeName())
                .materialId(request.getMaterialId())
                .materialName(request.getMaterialName())
                .currency(request.getCurrency())
                .unit(request.getUnit())
                .stockQty(request.getStockQty())
                .stockPrice(request.getStockPrice())
                .incomingQty(request.getIncomingQty())
                .incomingPrice(request.getIncomingPrice())
                .outgoingQty(request.getOutgoingQty())
                .outgoingPrice(request.getOutgoingPrice())
                .closingQty(request.getClosingQty())
                .closingPrice(request.getClosingPrice())
                .build();
        return InventoryStockResponse.from(inventoryStockRepository.save(entity));
    }

    /**
     * 벌크 저장
     */
    @Transactional
    public int saveBulk(List<InventoryStockSaveRequest> requests) {
        List<InventoryStock> entities = requests.stream().map(req ->
                InventoryStock.builder()
                        .month(req.getMonth())
                        .plant(req.getPlant())
                        .materialGroup(req.getMaterialGroup())
                        .materialType(req.getMaterialType())
                        .materialTypeName(req.getMaterialTypeName())
                        .materialId(req.getMaterialId())
                        .materialName(req.getMaterialName())
                        .currency(req.getCurrency())
                        .unit(req.getUnit())
                        .stockQty(req.getStockQty())
                        .stockPrice(req.getStockPrice())
                        .incomingQty(req.getIncomingQty())
                        .incomingPrice(req.getIncomingPrice())
                        .outgoingQty(req.getOutgoingQty())
                        .outgoingPrice(req.getOutgoingPrice())
                        .closingQty(req.getClosingQty())
                        .closingPrice(req.getClosingPrice())
                        .build()
        ).collect(Collectors.toList());
        inventoryStockRepository.saveAll(entities);
        return entities.size();
    }

    /**
     * 삭제
     */
    @Transactional
    public void delete(Long id) {
        inventoryStockRepository.deleteById(id);
    }
}
