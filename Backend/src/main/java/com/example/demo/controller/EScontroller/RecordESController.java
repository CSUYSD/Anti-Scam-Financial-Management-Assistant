package com.example.demo.controller.EScontroller;

import org.springframework.data.domain.Page;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.TransactionRecordES;
import com.example.demo.service.es.RecordSearchService;

import java.util.List;

@RestController
@RequestMapping("/records-search")
public class RecordESController {

    private final RecordSearchService recordSearchService;

    public RecordESController(RecordSearchService recordSearchService) {
        this.recordSearchService = recordSearchService;
    }

    @GetMapping("/search")
    public List<TransactionRecordES> searchRecords(@RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        return recordSearchService.searchRecords(keyword, page, size);
    }

    @GetMapping("/advanced-search")
    public SearchHits<TransactionRecordES> advancedSearch(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        return recordSearchService.advancedSearch(description, type, minAmount, maxAmount);
    }

}