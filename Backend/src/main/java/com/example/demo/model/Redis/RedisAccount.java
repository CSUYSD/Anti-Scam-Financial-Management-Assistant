package com.example.demo.model.Redis;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
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
