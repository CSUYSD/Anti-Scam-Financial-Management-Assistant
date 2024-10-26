package com.example.demo.utility.converter;

import com.example.demo.model.dto.TransactionRecordDTO;
import com.google.common.truth.Truth;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@RunWith(MockitoJUnitRunner.class)
public class PromptConverterTest {

    public static void main(String[] args) throws Exception {
        PromptConverterTest test = new PromptConverterTest();
        test.testParseRecentTransactionRecordsToPrompt();
        test.testParseLatestTransactionRecordToPrompt();
        test.testEmptyRecords();
        test.testNullRecord();
    }

    public void testParseRecentTransactionRecordsToPrompt() throws Exception {
        // Arrange
        List<TransactionRecordDTO> records = createTestRecords();

        // Act
        String result = PromptConverter.parseRecentTransactionRecordsToPrompt(records);

        // Assert
        Truth.assertThat(result).contains("Type: EXPENSE");
        Truth.assertThat(result).contains("Amount: 100.00");
        Truth.assertThat(result).contains("Category: Food");
        System.out.println("testParseRecentTransactionRecordsToPrompt passed!");
    }

    public void testParseLatestTransactionRecordToPrompt() throws Exception {
        // Arrange
        TransactionRecordDTO record = createTestRecord();

        // Act
        String result = PromptConverter.parseLatestTransactionRecordToPrompt(record);

        // Assert
        Truth.assertThat(result).startsWith("latest record:");
        Truth.assertThat(result).contains("Type: EXPENSE");
        Truth.assertThat(result).contains("Amount: 100.00");
        System.out.println("testParseLatestTransactionRecordToPrompt passed!");
    }

    public void testEmptyRecords() throws Exception {
        // Arrange
        List<TransactionRecordDTO> emptyRecords = new ArrayList<>();

        // Act
        String result = PromptConverter.parseRecentTransactionRecordsToPrompt(emptyRecords);

        // Assert
        Truth.assertThat(result).isEqualTo("No records found.");
        System.out.println("testEmptyRecords passed!");
    }

    public void testNullRecord() throws Exception {
        // Act
        String result = PromptConverter.parseLatestTransactionRecordToPrompt(null);

        // Assert
        Truth.assertThat(result).isEqualTo("No records found.");
        System.out.println("testNullRecord passed!");
    }

    private List<TransactionRecordDTO> createTestRecords() {
        List<TransactionRecordDTO> records = new ArrayList<>();
        records.add(createTestRecord());
        records.add(createTestRecord());
        return records;
    }

    private TransactionRecordDTO createTestRecord() {
        TransactionRecordDTO record = new TransactionRecordDTO();
        record.setType("EXPENSE");
        record.setAmount(100.00);
        record.setTransactionTime(ZonedDateTime.now(ZoneId.of("UTC")));
        record.setCategory("Food");
        record.setTransactionMethod("Cash");
        record.setTransactionDescription("Lunch");
        return record;
    }
}