package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Cacheable
public class TransactionUsers {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        @NotBlank
        @Size(min = 3, max = 20)
        private String username;

        @Column(nullable = false)
        @NotBlank
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
                )
        private String password;

        @Column(nullable = false)
        @NotBlank
        @Email
        private String email;

        private String phone;

        private String DOB;

        private String fullName;

        @OneToMany(mappedBy = "transactionUsers")  // 关联到 Account 表
        private List<Account> accounts = new ArrayList<>();

        @ManyToOne
        @JoinColumn(name = "role_id")
        private UserRole role;

        public UserRole getRole() {
                return role;
        }
}