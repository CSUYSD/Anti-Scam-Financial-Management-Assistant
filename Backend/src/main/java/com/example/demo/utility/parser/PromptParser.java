package com.example.demo.utility.parser;

import com.example.demo.model.TransactionRecord;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class PromptParser {
    private static final int MAX_RECORDS = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");

    public static String parseLatestTransactionRecordsToPrompt(List<TransactionRecord> records) {
        List<TransactionRecord> processedRecords = new ArrayList<>(records);
        if (!processedRecords.isEmpty()) {
            processedRecords.remove(0);
        }
        if (processedRecords.isEmpty()) {
            return "No records found.";
        }
        StringBuilder sb = new StringBuilder();
        processedRecords.stream()
                .limit(MAX_RECORDS)
                .skip(1) //avoid latest record
                .forEach(record -> {
                    sb.append("Record: ").append(parseTransactionRecordToString(record)).append("\n");
                });

        return sb.toString();
    }

    private static String parseTransactionRecordToString(TransactionRecord record) {
        return String.format("{Type: %s} {Amount: %.2f} {Date: %s} {Category: %s} {Transaction Method: %s} {Description: %s}",
                record.getType(),
                record.getAmount(),
                record.getTransactionTime().format(DATE_FORMATTER),
                record.getCategory(),
                record.getTransactionMethod(),
                record.getTransactionDescription());
    }
}
