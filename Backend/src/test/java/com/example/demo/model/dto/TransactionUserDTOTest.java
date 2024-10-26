package com.example.demo.model.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Set;
import jakarta.validation.ConstraintViolation;

public class TransactionUserDTOTest {
    private static Validator validator;

    public static void main(String[] args) {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();

            testValidUserDTO();
            testInvalidUsername();
            testInvalidPassword();
            testInvalidEmail();
        } catch (Exception e) {
            System.err.println("Test failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testValidUserDTO() {
        try {
            TransactionUserDTO dto = new TransactionUserDTO();
            dto.setUsername("testUser");
            dto.setPassword("Test123@abc");
            dto.setEmail("test@example.com");
            dto.setPhone("1234567890");
            dto.setDob(LocalDate.of(1990, 1, 1));
            dto.setAvatar("avatar.jpg");
            dto.setAccountName(Arrays.asList("Account1", "Account2"));

            Set<ConstraintViolation<TransactionUserDTO>> violations = validator.validate(dto);
            if (violations.isEmpty()) {
                System.out.println("testValidUserDTO passed!");
            } else {
                throw new AssertionError("Expected no violations, but got: " + violations);
            }
        } catch (Exception e) {
            System.err.println("testValidUserDTO failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testInvalidUsername() {
        try {
            TransactionUserDTO dto = new TransactionUserDTO();
            dto.setUsername("ab"); // 太短
            dto.setPassword("Test123@abc");
            dto.setEmail("test@example.com");

            Set<ConstraintViolation<TransactionUserDTO>> violations = validator.validate(dto);
            if (!violations.isEmpty() && violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("username"))) {
                System.out.println("testInvalidUsername passed!");
            } else {
                throw new AssertionError("Expected username violation, but got none");
            }
        } catch (Exception e) {
            System.err.println("testInvalidUsername failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testInvalidPassword() {
        try {
            TransactionUserDTO dto = new TransactionUserDTO();
            dto.setUsername("testUser");
            dto.setPassword("weak"); // 不符合密码规则
            dto.setEmail("test@example.com");

            Set<ConstraintViolation<TransactionUserDTO>> violations = validator.validate(dto);
            if (!violations.isEmpty() && violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("password"))) {
                System.out.println("testInvalidPassword passed!");
            } else {
                throw new AssertionError("Expected password violation, but got none");
            }
        } catch (Exception e) {
            System.err.println("testInvalidPassword failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testInvalidEmail() {
        try {
            TransactionUserDTO dto = new TransactionUserDTO();
            dto.setUsername("testUser");
            dto.setPassword("Test123@abc");
            dto.setEmail("invalid-email"); // 无效的邮箱格式

            Set<ConstraintViolation<TransactionUserDTO>> violations = validator.validate(dto);
            if (!violations.isEmpty() && violations.stream()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("email"))) {
                System.out.println("testInvalidEmail passed!");
            } else {
                throw new AssertionError("Expected email violation, but got none");
            }
        } catch (Exception e) {
            System.err.println("testInvalidEmail failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}