package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRecordDTO {
    private String type;  // Income, Expense
    private String category;    //
    private Double amount;           //
    private String TransactionMethod;    //
    private ZonedDateTime transactionTime; //
    private String transactionDescription; //

}
