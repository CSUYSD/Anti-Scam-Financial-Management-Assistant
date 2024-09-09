package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
=======
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
>>>>>>> 2d84234ffa497742be8ba04f4af4df7490abdd29
import lombok.Data;



@Entity
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    private String accountName;

<<<<<<< HEAD
    @ManyToOne()
    @JsonBackReference
    private TransactionUsers transactionUsers;    // 一个用户对应多个账户
=======
    @ManyToOne(fetch = FetchType.LAZY)
    private TransactionUser transactionUser;    // 一个用户对应多个账户
>>>>>>> 2d84234ffa497742be8ba04f4af4df7490abdd29

    @OneToMany(mappedBy = "account")
    private List<TransactionRecord> transactionRecords = new ArrayList<>();    // 一个账户对应多个交易记录
}
