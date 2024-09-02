package com.example.demo.Dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.UserRole;

public interface UserRoleDao extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByRole(String role);

}
