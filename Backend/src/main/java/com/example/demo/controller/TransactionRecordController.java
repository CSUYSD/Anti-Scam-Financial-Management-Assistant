package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.TransactionRecord;
import com.example.demo.service.TransactionRecordService;
@RestController
@RequestMapping("/records")
public class TransactionRecordController {

    private final TransactionRecordService recordService;

    public TransactionRecordController(TransactionRecordService recordService) {
        this.recordService = recordService;
    }

    @GetMapping("/all/{accountId}")
    public ResponseEntity<List<TransactionRecord>> getAllRecord(@PathVariable Long accountId) {
        List<TransactionRecord> transactions = recordService.getAllRecordsByAccount(accountId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionRecord> getRecordById(@PathVariable Long id, Long accountId) {
        try {
            TransactionRecord record = recordService.getRecordById(id,accountId);
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

    // 创建新的交易记录
    @PostMapping("/create")
    public ResponseEntity<String> createTransactionRecord(@RequestBody TransactionRecord transactionRecord) {
        try {
            recordService.saveTransactionRecord(transactionRecord);
            return ResponseEntity.status(HttpStatus.CREATED).body("Transaction record has been created successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating transaction record: " + e.getMessage());
        }
    }

    // 更新交易记录
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateTransactionRecord(@PathVariable Long id, @RequestBody TransactionRecord transactionRecord) {
        try {
            recordService.updateTransactionRecord(id, transactionRecord);
            return ResponseEntity.ok("Transaction record updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating transaction record: " + e.getMessage());
        }
    }

    // 删除交易记录
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTransactionRecord(@PathVariable Long id) {
        try {
            recordService.deleteTransactionRecord(id);
            return ResponseEntity.ok("Transaction record deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting transaction record: " + e.getMessage());
        }
    }

    @DeleteMapping("/batch")
    public ResponseEntity<String> deleteRecordsInBatch(@RequestParam Long accountId, @RequestBody List<Long> recordIds) {
        try {
            recordService.deleteTransactionRecordsInBatch(accountId, recordIds);
            return ResponseEntity.ok("Records deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete records: " + e.getMessage());
        }
    }
}

