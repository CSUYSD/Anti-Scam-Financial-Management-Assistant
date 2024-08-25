package com.example.demo.service;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.TransactionUsers;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;
import java.util.Optional;

public interface UserService extends UserDetailsService {
    List<TransactionUsers> findAll();

    Optional<TransactionUsers> findById(Long id);

    Optional<TransactionUsers> findByUsername(String username);

    void updateUser(Long id, TransactionUsers updatedUser) throws UserNotFoundException;

    void deleteUser(Long id) throws UserNotFoundException, DataIntegrityViolationException;
}