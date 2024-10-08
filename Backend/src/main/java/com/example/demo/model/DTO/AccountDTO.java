package com.example.demo.model.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AccountDTO {
    @Pattern(regexp = "^[a-zA-Z0-9]{3,20}$", message = "Account name must be between 3 and 20 characters and contain only letters and numbers")
    @NotBlank(message = "Account name cannot be blank")
    private String name;
    private Double total_income;
    private Double total_expense;
}
