package com.example.demo.utility.converter;

import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.model.TransactionRecord;

public class TransactionRecordConverter {
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

    public static TransactionRecordDTO convertTransactionRecordToDTO(TransactionRecord record) {
        // 创建并返回一个包含所需数据的 DTO 对象
        return new TransactionRecordDTO(
                record.getType(),
                record.getCategory(),
                record.getAmount(),
                record.getTransactionMethod(),
                record.getTransactionTime(),
                record.getTransactionDescription()
        );
    }

    public static void updateTransactionRecordFromDTO(TransactionRecord transactionRecord, TransactionRecordDTO dto) {
        transactionRecord.setAmount(dto.getAmount());
        transactionRecord.setCategory(dto.getCategory());
        transactionRecord.setType(dto.getType());
        transactionRecord.setTransactionTime(dto.getTransactionTime());
        transactionRecord.setTransactionDescription(dto.getTransactionDescription());
        transactionRecord.setTransactionMethod(dto.getTransactionMethod());
    }
}
