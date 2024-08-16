package com.example.demo.model;

import com.example.demo.constant.IncomeExpense;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

import java.time.ZonedDateTime;

@Entity
@Data
public class TransactionRecord {
    @Id
    @Column()
    private long id;
    private IncomeExpense incomeOrExpense;  // 收/支
    private String TransactionType;    //交易类型
    private double amount;           // 金额（元）
    private String TransactionMethod;    // 支付方式
    private ZonedDateTime transactionTime; // 交易时间
    private String transactionDescription; // 交易描述
    @ManyToOne
    private Account account; // 一个账户对应多个交易记录
}
