package com.example.demo.Dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.TransactionUser;

// CREATE TABLE transaction_user (
//     id BIGINT PRIMARY KEY AUTO_INCREMENT,
//     username VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     phone VARCHAR(20),
//     dob DATE,
//     full_name VARCHAR(255),
//     role_id INTEGER,
//     CONSTRAINT fk_role
//         FOREIGN KEY (role_id)
//         REFERENCES user_roles(role_id)
// );

public interface UserDao extends JpaRepository<TransactionUser, Long> {
    public Optional<TransactionUser> findByUsername(String username);
}

