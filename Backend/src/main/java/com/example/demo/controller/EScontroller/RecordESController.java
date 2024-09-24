//package com.example.demo.controller.EScontroller;
//
//import org.springframework.data.domain.Page;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.example.demo.model.TransactionRecordES;
//import com.example.demo.service.RecordService;
//
//@RestController
//@RequestMapping("/api/transactions-search")
//public class RecordESController {
//
//    private final RecordService recordService;
//
//    public RecordESController(RecordService recordService) {
//        this.recordService = recordService;
//    }
//
//    @GetMapping("/search")
//    public Page<TransactionRecordES> searchTransactions(
//            @RequestParam(required = false) String keyword,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        return recordService.searchTransactions(keyword, page, size);
//    }
//
//    @GetMapping("/advanced-search")
//    public SearchHits<TransactionRecordES> advancedSearch(
//            @RequestParam(required = false) String description,
//            @RequestParam(required = false) String type,
//            @RequestParam(required = false) Double minAmount,
//            @RequestParam(required = false) Double maxAmount) {
//        return recordService.advancedSearch(description, type, minAmount, maxAmount);
//    }
//
//}