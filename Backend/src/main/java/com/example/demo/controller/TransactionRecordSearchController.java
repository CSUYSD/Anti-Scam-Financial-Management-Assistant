package com.example.demo.controller;

import com.example.demo.model.TransactionRecordES;
import com.example.demo.service.RecordService;
import org.springframework.data.domain.Page;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions-search")
public class TransactionRecordSearchController {

    private final RecordService recordService;

    public TransactionRecordSearchController(RecordService recordService) {
        this.recordService = recordService;
    }

    @GetMapping("/search")
    public Page<TransactionRecordES> searchTransactions(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return recordService.searchTransactions(keyword, page, size);
    }

    @GetMapping("/advanced-search")
    public SearchHits<TransactionRecordES> advancedSearch(
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        return recordService.advancedSearch(description, type, minAmount, maxAmount);
    }

    @GetMapping("/{id}")
    public TransactionRecordES getTransactionById(@PathVariable String id) {
        return recordService.getTransactionById(id);
    }
}