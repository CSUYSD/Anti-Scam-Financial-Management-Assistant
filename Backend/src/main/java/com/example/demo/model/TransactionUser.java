
package com.example.demo.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.model.security.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;

@Entity
@Data
@Table(name = "transaction_users")
public class TransactionUser {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column(nullable = false)
        @NotBlank
        @Size(min = 3, max = 20)
        private String username;
        @Column(nullable = false)
        @NotBlank
        private String password;
        @Column(nullable = false)
        @NotBlank
        private String email;
        private String phone;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        @JsonDeserialize(using = LocalDateDeserializer.class)
        @JsonSerialize(using = LocalDateSerializer.class)
        private LocalDate dob;
        private String avatar;

        // 关联到 Account 表
        @OneToMany(mappedBy = "transactionUser", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<Account> accounts = new ArrayList<>();

        @Getter
        @ManyToOne
        @JoinColumn(name = "role_id")
        private UserRole role;

        @Getter
        @OneToMany(mappedBy = "transactionUser", fetch = FetchType.LAZY)
        @JsonManagedReference
        private List<FinancialReport> financialReports = new ArrayList<>();

}
