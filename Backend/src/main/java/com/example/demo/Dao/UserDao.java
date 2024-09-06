package com.example.demo.Dao;

import com.example.demo.model.TransactionUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDao extends JpaRepository<TransactionUser, Long> {
    Optional<TransactionUser> findByUsername(String username);
}

