package com.example.demo.utility.converter;

import com.example.demo.model.Account;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.google.common.truth.Truth;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@RunWith(MockitoJUnitRunner.class)
public class TransactionRecordConverterTest {

    public static void main(String[] args) throws Exception {
        TransactionRecordConverterTest test = new TransactionRecordConverterTest();
        test.testToTransactionRecord();
        test.testConvertTransactionRecordToDTO();
        test.testUpdateTransactionRecordFromDTO();
    }

    public void testToTransactionRecord() throws Exception {
        // Arrange
        TransactionRecordDTO dto = createTestDTO();

        // Act
        TransactionRecord result = TransactionRecordConverter.toTransactionRecord(dto);

        // Assert
        assertTransactionRecordMatchesDTO(result, dto);
        System.out.println("testToTransactionRecord passed!");
    }

    public void testConvertTransactionRecordToDTO() throws Exception {
        // Arrange
        TransactionRecord record = createTestRecord();

        // Act
        TransactionRecordDTO result = TransactionRecordConverter.convertTransactionRecordToDTO(record);

        // Assert
        assertDTOMatchesRecord(result, record);
        System.out.println("testConvertTransactionRecordToDTO passed!");
    }

    public void testUpdateTransactionRecordFromDTO() throws Exception {
        // Arrange
        TransactionRecord record = createTestRecord();
        TransactionRecordDTO updatedDTO = createUpdatedDTO();

        // Act
        TransactionRecordConverter.updateTransactionRecordFromDTO(record, updatedDTO);

        // Assert
        assertTransactionRecordMatchesDTO(record, updatedDTO);
        System.out.println("testUpdateTransactionRecordFromDTO passed!");
    }

    private TransactionRecordDTO createTestDTO() {
        return new TransactionRecordDTO(
                "EXPENSE",
                "Food",
                100.00,
                "Cash",
                ZonedDateTime.now(ZoneId.of("UTC")),
                "Lunch"
        );
    }

    private TransactionRecordDTO createUpdatedDTO() {
        return new TransactionRecordDTO(
                "INCOME",
                "Salary",
                5000.00,
                "Bank Transfer",
                ZonedDateTime.now(ZoneId.of("UTC")),
                "Monthly Salary"
        );
    }

    private TransactionRecord createTestRecord() {
        TransactionRecord record = new TransactionRecord();
        record.setId(1L);
        record.setUserId(1L);
        record.setType("EXPENSE");
        record.setCategory("Food");
        record.setAmount(100.00);
        record.setTransactionMethod("Cash");
        record.setTransactionTime(ZonedDateTime.now(ZoneId.of("UTC")));
        record.setTransactionDescription("Lunch");

        Account account = new Account();
        account.setId(1L);
        record.setAccount(account);

        return record;
    }

    private void assertTransactionRecordMatchesDTO(TransactionRecord record, TransactionRecordDTO dto) {
        Truth.assertThat(record.getType()).isEqualTo(dto.getType());
        Truth.assertThat(record.getCategory()).isEqualTo(dto.getCategory());
        Truth.assertThat(record.getAmount()).isEqualTo(dto.getAmount());
        Truth.assertThat(record.getTransactionMethod()).isEqualTo(dto.getTransactionMethod());
        Truth.assertThat(record.getTransactionTime()).isEqualTo(dto.getTransactionTime());
        Truth.assertThat(record.getTransactionDescription()).isEqualTo(dto.getTransactionDescription());
    }

    private void assertDTOMatchesRecord(TransactionRecordDTO dto, TransactionRecord record) {
        Truth.assertThat(dto.getType()).isEqualTo(record.getType());
        Truth.assertThat(dto.getCategory()).isEqualTo(record.getCategory());
        Truth.assertThat(dto.getAmount()).isEqualTo(record.getAmount());
        Truth.assertThat(dto.getTransactionMethod()).isEqualTo(record.getTransactionMethod());
        Truth.assertThat(dto.getTransactionTime()).isEqualTo(record.getTransactionTime());
        Truth.assertThat(dto.getTransactionDescription()).isEqualTo(record.getTransactionDescription());
    }
}