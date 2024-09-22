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
    private String transactionType;    //

    private Double amount;           //
    private String TransactionMethod;    //
    private ZonedDateTime transactionTime; //
    private String transactionDescription; //
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account; // 一个账户对应多个交易记录


}
