package com.example.demo.model;

import java.time.ZonedDateTime;


import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class TransactionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String type;  // Income, Expense
    private String category;
    private Double amount;
    private String TransactionMethod;
    private ZonedDateTime transactionTime;
    private String transactionDescription;

    @Column(name = "user_id")
    private long userId;
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account; // 一个账户对应多个交易记录

}
