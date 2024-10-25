package com.example.demo.model.dto;

import static com.google.common.truth.Truth.assertThat;
import java.time.ZonedDateTime;

public class TransactionRecordDTOTest {

    public static void main(String[] args) {
        try {
            testConstructorAndGetters();
            testSettersAndGetters();
            testNoArgsConstructor();
            testAllArgsConstructor();
            testEqualsAndHashCode();
            testToString();
        } catch (Exception e) {
            System.err.println("Tests failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testConstructorAndGetters() {
        try {
            ZonedDateTime now = ZonedDateTime.now();
            TransactionRecordDTO dto = new TransactionRecordDTO(
                    "Income",
                    "Salary",
                    1000.0,
                    "Bank Transfer",
                    now,
                    "Monthly salary"
            );

            assertThat(dto.getType()).isEqualTo("Income");
            assertThat(dto.getCategory()).isEqualTo("Salary");
            assertThat(dto.getAmount()).isEqualTo(1000.0);
            assertThat(dto.getTransactionMethod()).isEqualTo("Bank Transfer");
            assertThat(dto.getTransactionTime()).isEqualTo(now);
            assertThat(dto.getTransactionDescription()).isEqualTo("Monthly salary");

            System.out.println("testConstructorAndGetters passed!");
        } catch (Exception e) {
            System.err.println("testConstructorAndGetters failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testSettersAndGetters() {
        try {
            TransactionRecordDTO dto = new TransactionRecordDTO();
            ZonedDateTime now = ZonedDateTime.now();

            dto.setType("Expense");
            dto.setCategory("Food");
            dto.setAmount(50.0);
            dto.setTransactionMethod("Cash");
            dto.setTransactionTime(now);
            dto.setTransactionDescription("Lunch");

            assertThat(dto.getType()).isEqualTo("Expense");
            assertThat(dto.getCategory()).isEqualTo("Food");
            assertThat(dto.getAmount()).isEqualTo(50.0);
            assertThat(dto.getTransactionMethod()).isEqualTo("Cash");
            assertThat(dto.getTransactionTime()).isEqualTo(now);
            assertThat(dto.getTransactionDescription()).isEqualTo("Lunch");

            System.out.println("testSettersAndGetters passed!");
        } catch (Exception e) {
            System.err.println("testSettersAndGetters failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testNoArgsConstructor() {
        try {
            TransactionRecordDTO dto = new TransactionRecordDTO();

            assertThat(dto.getType()).isNull();
            assertThat(dto.getCategory()).isNull();
            assertThat(dto.getAmount()).isNull();
            assertThat(dto.getTransactionMethod()).isNull();
            assertThat(dto.getTransactionTime()).isNull();
            assertThat(dto.getTransactionDescription()).isNull();

            System.out.println("testNoArgsConstructor passed!");
        } catch (Exception e) {
            System.err.println("testNoArgsConstructor failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testAllArgsConstructor() {
        try {
            ZonedDateTime now = ZonedDateTime.now();
            TransactionRecordDTO dto = new TransactionRecordDTO(
                    "Income",
                    "Investment",
                    2000.0,
                    "Wire Transfer",
                    now,
                    "Stock dividend"
            );

            assertThat(dto.getType()).isEqualTo("Income");
            assertThat(dto.getCategory()).isEqualTo("Investment");
            assertThat(dto.getAmount()).isEqualTo(2000.0);
            assertThat(dto.getTransactionMethod()).isEqualTo("Wire Transfer");
            assertThat(dto.getTransactionTime()).isEqualTo(now);
            assertThat(dto.getTransactionDescription()).isEqualTo("Stock dividend");

            System.out.println("testAllArgsConstructor passed!");
        } catch (Exception e) {
            System.err.println("testAllArgsConstructor failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testEqualsAndHashCode() {
        try {
            ZonedDateTime now = ZonedDateTime.now();
            TransactionRecordDTO dto1 = new TransactionRecordDTO(
                    "Income", "Salary", 1000.0, "Bank Transfer", now, "Monthly salary"
            );
            TransactionRecordDTO dto2 = new TransactionRecordDTO(
                    "Income", "Salary", 1000.0, "Bank Transfer", now, "Monthly salary"
            );
            TransactionRecordDTO dto3 = new TransactionRecordDTO(
                    "Expense", "Food", 50.0, "Cash", now, "Lunch"
            );

            assertThat(dto1).isEqualTo(dto2);
            assertThat(dto1.hashCode()).isEqualTo(dto2.hashCode());
            assertThat(dto1).isNotEqualTo(dto3);

            System.out.println("testEqualsAndHashCode passed!");
        } catch (Exception e) {
            System.err.println("testEqualsAndHashCode failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testToString() {
        try {
            ZonedDateTime now = ZonedDateTime.now();
            TransactionRecordDTO dto = new TransactionRecordDTO(
                    "Income", "Salary", 1000.0, "Bank Transfer", now, "Monthly salary"
            );

            String toString = dto.toString();
            assertThat(toString).contains("Income");
            assertThat(toString).contains("Salary");
            assertThat(toString).contains("1000.0");
            assertThat(toString).contains("Bank Transfer");
            assertThat(toString).contains("Monthly salary");

            System.out.println("testToString passed!");
        } catch (Exception e) {
            System.err.println("testToString failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}