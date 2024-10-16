package com.example.demo.model.Redis;

import com.example.demo.model.TransactionRecord;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
@Data
@NoArgsConstructor
public class RedisAccount {
    private Long id;
    private String name;
    private Double total_income;
    private Double total_expense;

    public RedisAccount(Long id, String name, Double total_income, Double total_expense) {
        this.id = id;
        this.name = name;
        this.total_income = total_income;
        this.total_expense = total_expense;
    }
}
