package com.example.demo.Dao;


import com.example.demo.model.TransactionUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDao extends JpaRepository<TransactionUsers, Long> {
    Optional<TransactionUsers> findByUsername(String username);
}

