package com.example.demo.model.DTO;

import lombok.Data;

@Data
public class TransactionUserDTO {
    private String username;
    private String accountName;
    private String email;
    private String phone;
    private String DOB;
    private String fullName;
}