package com.example.demo.model.security;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_roles")
@Data
public class UserRole {
    @Id
    private Integer role_id;

    @Column(unique = true)
    private String role;
    public String getRoleName() {return role;}
}