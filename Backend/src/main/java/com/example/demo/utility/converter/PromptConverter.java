package com.example.demo.utility.converter;

import com.example.demo.model.dto.TransactionRecordDTO;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PromptConverter {
    private static final int MAX_RECORDS = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");

    public static String parseRecentTransactionRecordsToPrompt(List<TransactionRecordDTO> records, Boolean isForWarning) {
        List<TransactionRecordDTO> processedRecords = new ArrayList<>(records);
        if (!processedRecords.isEmpty() && isForWarning) {
            processedRecords.remove(0);
        }
        System.out.printf("====================================Fetched Recent Records: %s\n", processedRecords);
        if (processedRecords.isEmpty()) {
            return "No records found.";
        }
        StringBuilder sb = new StringBuilder();
        processedRecords.stream()
                .limit(MAX_RECORDS)
                .forEach(record -> {
                    sb.append("Record: ").append(parseTransactionRecordToString(record)).append("\n");
                });

        return sb.toString();
    }
    public static String parseLatestTransactionRecordToPrompt(TransactionRecordDTO record) {
        if (record == null) {
            return "No records found.";
        }
        return "latest record:" + parseTransactionRecordToString(record);
    }

    private static String parseTransactionRecordToString(TransactionRecordDTO record) {
        return String.format("Type: %s; Amount: %.2f; Date: %s; Category: %s; Transaction Method: %s; Description: %s",
                record.getType(),
                record.getAmount(),
                record.getTransactionTime().format(DATE_FORMATTER),
                record.getCategory(),
                record.getTransactionMethod(),
                record.getTransactionDescription());
    }

}
