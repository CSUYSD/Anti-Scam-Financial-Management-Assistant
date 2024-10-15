package com.example.demo.utility.parser;

import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.model.TransactionRecord;

public class DtoParser {
    public static TransactionRecord toTransactionRecord(TransactionRecordDTO transactionRecordDTO) {
        TransactionRecord transactionRecord = new TransactionRecord();
        transactionRecord.setAmount(transactionRecordDTO.getAmount());
        transactionRecord.setCategory(transactionRecordDTO.getCategory());
        transactionRecord.setType(transactionRecordDTO.getType());
        transactionRecord.setTransactionTime(transactionRecordDTO.getTransactionTime());
        transactionRecord.setTransactionDescription(transactionRecordDTO.getTransactionDescription());
        transactionRecord.setTransactionMethod(transactionRecordDTO.getTransactionMethod());
        return transactionRecord;
    }
}
