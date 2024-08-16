package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    private String accountName;

    @ManyToOne()
    private TransactionUsers transactionUsers;    // 一个用户对应多个账户

    @OneToMany(mappedBy = "account")
    private List<TransactionRecord> transactionRecords = new ArrayList<>();    // 一个账户对应多个交易记录
}
