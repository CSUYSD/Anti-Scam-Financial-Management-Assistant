package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.TransactionRecord;
import com.example.demo.service.TransactionRecordService;
@RestController
@RequestMapping("/records")
public class TransactionRecordController {

    private final TransactionRecordService recordService;

    public TransactionRecordController(TransactionRecordService recordService) {
        this.recordService = recordService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransactionRecord>> getAllRecord() {
        List<TransactionRecord> transactions = recordService.getAllRecord();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionRecord> getRecordById(@PathVariable Long id) {
        try {
            TransactionRecord record = recordService.getRecordById(id);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<TransactionRecord>> getRecordsByType(@PathVariable String type) {
        try {
            String incomeOrExpense = type.toUpperCase();
            List<TransactionRecord> records = recordService.findByType(incomeOrExpense);
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
