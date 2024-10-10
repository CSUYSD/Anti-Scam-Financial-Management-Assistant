package com.example.demo.controller;

import java.util.List;


import com.example.demo.model.DTO.TransactionRecordDTO;
import com.example.demo.utility.JWT.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


import com.example.demo.model.TransactionRecord;
import com.example.demo.service.TransactionRecordService;
@RestController
@RequestMapping("/records")

@Validated
public class TransactionRecordController {

    private final TransactionRecordService recordService;
    private final JwtUtil jwtUtil;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public TransactionRecordController(TransactionRecordService recordService, JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.recordService = recordService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransactionRecord>> getAllRecordByAccountId(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        String pattern = "login_user:" + userId + ":current_account";
        String accountId = stringRedisTemplate.opsForValue().get(pattern);
        List<TransactionRecord> transactions = recordService.getAllRecordsByAccountId(Long.valueOf(accountId));
        return ResponseEntity.ok(transactions);
    }

    @Transactional
    @PostMapping("/create")
    public ResponseEntity<String> addTransactionRecord(@RequestHeader("Authorization") String token, @RequestBody TransactionRecordDTO transactionRecordDTO) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("未提供令牌");
        }
        try {
            recordService.addTransactionRecord(token, transactionRecordDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Transaction record has been created successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating transaction record: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateTransactionRecord(@PathVariable Long id, @RequestBody TransactionRecord transactionRecord) {
        try {
            recordService.updateTransactionRecord(id, transactionRecord);
            return ResponseEntity.ok("Transaction record updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating transaction record: " + e.getMessage());
        }
    }

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

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<TransactionRecord>> getRecordsByAccountIdAndType(@RequestHeader("Authorization") String token, @PathVariable String type) {
        try {
            String incomeOrExpense = type.toUpperCase();
            Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            String pattern = "login_user:" + userId + ":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            List<TransactionRecord> records = recordService.findRecordByAccountIdAndType(incomeOrExpense, Long.valueOf(accountId));
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/five-days")
    public ResponseEntity<List<TransactionRecord>> getLatestFiveDaysRecord(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            String pattern = "login_user:" + userId + ":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            List<TransactionRecord> records = recordService.getLatestFiveDaysRecords(Long.valueOf(accountId));
            return ResponseEntity.ok(records);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
