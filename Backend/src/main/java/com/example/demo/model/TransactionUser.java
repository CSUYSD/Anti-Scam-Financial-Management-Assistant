package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class TransactionUser {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column(nullable = false)
        @NotBlank
        @Size(min = 3, max = 20)
        private String username;
        @Column(nullable = false)
        @NotBlank
        private String password;
        @Column(nullable = false)
        @NotBlank
        @Email
        private String email;
        private String phone;
        private String DOB;
        private String fullName;
        
        @OneToMany(mappedBy = "transactionUser")  // 关联到 Account 表
        @JsonIgnore
        private List<Account> accounts = new ArrayList<>();
        @ManyToOne
        @JoinColumn(name = "role_id")
        @JsonIgnore
        private UserRole role;


        public UserRole getRole() {
                return role;
        }
}