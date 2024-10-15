package com.example.demo.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class TransactionRecordDTO {
    private String type;  // Income, Expense
    private String category;    //
    private Double amount;           //
    private String TransactionMethod;    //
    private ZonedDateTime transactionTime; //
    private String transactionDescription; //
}
