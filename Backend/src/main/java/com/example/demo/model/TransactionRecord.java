package com.example.demo.model;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class TransactionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String type;  // Income, Expense
    private String transactionType;    //交易类型
    private double amount;           // 金额（元）
    private String TransactionMethod;    // 支付方式
    private ZonedDateTime transactionTime; // 交易时间
    private String transactionDescription; // 交易描述
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account; // 一个账户对应多个交易记录
}
