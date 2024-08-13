package com.example.demo.repository;


import com.example.demo.model.TransactionUsers;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<TransactionUsers, Long> {
    Optional<TransactionUsers> findByUsername(String username);
}

