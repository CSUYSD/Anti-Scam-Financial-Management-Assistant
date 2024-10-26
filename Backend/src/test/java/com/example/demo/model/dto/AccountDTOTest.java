package com.example.demo.model.dto;

import com.google.common.truth.Truth;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;
import jakarta.validation.ConstraintViolation;

public class AccountDTOTest {
    private Validator validator;

    public static void main(String[] args) throws Exception {
        AccountDTOTest test = new AccountDTOTest();
        test.setup();
        test.testValidAccountName();
        test.testInvalidAccountName();
        test.testBlankAccountName();
    }

    public void setup() {
        try {
            ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
            validator = factory.getValidator();
            System.out.println("Setup completed successfully!");
        } catch (Exception e) {
            System.err.println("Setup failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void testValidAccountName() {
        try {
            // Arrange
            AccountDTO dto = new AccountDTO();
            dto.setName("validName123");
            dto.setTotal_income(1000.0);
            dto.setTotal_expense(500.0);

            // Act
            Set<ConstraintViolation<AccountDTO>> violations = validator.validate(dto);

            // Assert
            Truth.assertThat(violations).isEmpty();
            System.out.println("testValidAccountName passed!");
        } catch (Exception e) {
            System.err.println("testValidAccountName failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void testInvalidAccountName() {
        try {
            // Arrange
            AccountDTO dto = new AccountDTO();
            dto.setName("invalid@name");

            // Act
            Set<ConstraintViolation<AccountDTO>> violations = validator.validate(dto);

            // Assert
            Truth.assertThat(violations).isNotEmpty();
            Truth.assertThat(violations.iterator().next().getMessage())
                    .contains("Account name must be between 3 and 20 characters");
            System.out.println("testInvalidAccountName passed!");
        } catch (Exception e) {
            System.err.println("testInvalidAccountName failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void testBlankAccountName() {
        try {
            // Arrange
            AccountDTO dto = new AccountDTO();
            dto.setName("");

            // Act
            Set<ConstraintViolation<AccountDTO>> violations = validator.validate(dto);

            // Assert
            Truth.assertThat(violations).isNotEmpty();
            Truth.assertThat(violations.iterator().next().getMessage())
                    .contains("Account name must be between 3 and 20 characters and contain only letters and numbers");
            System.out.println("testBlankAccountName passed!");
        } catch (Exception e) {
            System.err.println("testBlankAccountName failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}