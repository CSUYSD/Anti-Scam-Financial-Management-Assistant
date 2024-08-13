package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.userdetails.User;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class TransactionUsers {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column()
        private String username;
        private String password;
        private String email;
        private String phone;
        private String DOB;
        private String fullName;

        @OneToMany(mappedBy = "transactionUsers")  // 关联到 Account 表
        private List<Account> accounts = new ArrayList<>();
}