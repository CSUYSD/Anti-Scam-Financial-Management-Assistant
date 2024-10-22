package com.example.demo.controller.es;

import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.web.bind.annotation.*;

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
    public List<TransactionRecordES> searchRecords(@RequestHeader("Authorization") String token,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        return recordSearchService.searchRecords(token, keyword, page, size);
    }

    @GetMapping("/advanced-search")
    public List<TransactionRecordES> advancedSearch(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        return recordSearchService.advancedSearch(token, description, type, minAmount, maxAmount);
    }

}