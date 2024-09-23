package com.example.demo.model.Redis;

import com.example.demo.model.TransactionRecord;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
public class RedisAccount {
    private Long id;
    private String name;
    private Double balance;
    private List<TransactionRecord> records;

    public RedisAccount(Long id, String name, Double balance, List<TransactionRecord> records) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.records = records;
    }
}