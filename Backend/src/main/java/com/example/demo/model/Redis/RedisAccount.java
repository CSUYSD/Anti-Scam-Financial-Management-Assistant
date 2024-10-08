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
    private Double total_income;
    private Double total_expense;
    private List<TransactionRecord> records;

    public RedisAccount(Long id, String name, Double total_income, Double total_expense, List<TransactionRecord> records) {
        this.id = id;
        this.name = name;
        this.total_income = total_income;
        this.total_expense = total_expense;
        this.records = records;
    }
}
