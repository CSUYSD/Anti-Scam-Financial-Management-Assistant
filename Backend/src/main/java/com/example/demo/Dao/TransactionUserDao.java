package com.example.demo.Dao;

import java.util.Optional;

import com.example.demo.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TransactionUser;
import org.springframework.data.jpa.repository.Query;


public interface TransactionUserDao extends JpaRepository<TransactionUser, Long> {
    public Optional<TransactionUser> findByUsername(String username);

}

