package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;



@Entity
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    private String accountName;

    @ManyToOne(fetch = FetchType.LAZY)
    private TransactionUser transactionUser;    // 一个用户对应多个账户

    @OneToMany(mappedBy = "account")
    private List<TransactionRecord> transactionRecords = new ArrayList<>();    // 一个账户对应多个交易记录
}
