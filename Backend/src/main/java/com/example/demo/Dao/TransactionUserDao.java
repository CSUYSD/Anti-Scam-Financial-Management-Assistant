package com.example.demo.Dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TransactionUser;


public interface TransactionUserDao extends JpaRepository<TransactionUser, Long> {
    public Optional<TransactionUser> findByUsername(String username);
}

