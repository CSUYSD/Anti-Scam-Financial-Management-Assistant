package com.example.demo.service.es;

import com.example.demo.model.Account;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.TransactionRecordES;
import com.example.demo.repository.TransactionRecordDao;
import com.example.demo.repository.es.RecordESDao;
import com.google.common.truth.Truth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;

public class RecordSyncServiceTest {

    private RecordSyncService recordSyncService;

    @Mock
    private TransactionRecordDao transactionRecordDao;

    @Mock
    private RecordESDao recordESDao;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        recordSyncService = new RecordSyncService(transactionRecordDao, recordESDao);
    }

    @Test
    public void testSyncToElasticsearch() {
        // Arrange
        TransactionRecord record = createTestRecord();
        ArgumentCaptor<TransactionRecordES> esRecordCaptor = ArgumentCaptor.forClass(TransactionRecordES.class);

        // Act
        recordSyncService.syncToElasticsearch(record);

        // Assert
        verify(recordESDao).save(esRecordCaptor.capture());
        TransactionRecordES capturedRecord = esRecordCaptor.getValue();
        verifyESRecord(capturedRecord, record);
    }

    @Test
    public void testDeleteFromElasticsearch() {
        // Arrange
        Long recordId = 1L;

        // Act
        recordSyncService.deleteFromElasticsearch(recordId);

        // Assert
        verify(recordESDao).deleteById(String.valueOf(recordId));
    }

    @Test
    public void testDeleteFromElasticsearchInBatch() {
        // Arrange
        List<Long> recordIds = Arrays.asList(1L, 2L, 3L);
        List<String> expectedEsIds = Arrays.asList("1", "2", "3");

        // Act
        recordSyncService.deleteFromElasticsearchInBatch(recordIds);

        // Assert
        verify(recordESDao).deleteAllById(expectedEsIds);
    }

    @Test
    public void testUpdateInElasticsearchSuccess() {
        // Arrange
        TransactionRecord record = createTestRecord();
        when(recordESDao.existsById(String.valueOf(record.getId()))).thenReturn(true);
        ArgumentCaptor<TransactionRecordES> esRecordCaptor = ArgumentCaptor.forClass(TransactionRecordES.class);

        // Act
        recordSyncService.updateInElasticsearch(record);

        // Assert
        verify(recordESDao).save(esRecordCaptor.capture());
        TransactionRecordES capturedRecord = esRecordCaptor.getValue();
        verifyESRecord(capturedRecord, record);
    }

    @Test
    public void testUpdateInElasticsearchNotFound() {
        // Arrange
        TransactionRecord record = createTestRecord();
        when(recordESDao.existsById(String.valueOf(record.getId()))).thenReturn(false);

        // Act & Assert
        RuntimeException exception = org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> {
            recordSyncService.updateInElasticsearch(record);
        });
        Truth.assertThat(exception).hasMessageThat().contains("Record not found in Elasticsearch");
    }

    private TransactionRecord createTestRecord() {
        TransactionRecord record = new TransactionRecord();
        record.setId(1L);
        record.setType("EXPENSE");
        record.setCategory("Food");
        record.setAmount(100.0);
        record.setTransactionMethod("Cash");
        record.setTransactionTime(ZonedDateTime.now());
        record.setTransactionDescription("Test transaction");
        record.setUserId(1L);

        Account account = new Account();
        account.setId(1L);
        record.setAccount(account);

        return record;
    }

    private void verifyESRecord(TransactionRecordES esRecord, TransactionRecord record) {
        Truth.assertThat(esRecord.getId()).isEqualTo(String.valueOf(record.getId()));
        Truth.assertThat(esRecord.getType()).isEqualTo(record.getType());
        Truth.assertThat(esRecord.getCategory()).isEqualTo(record.getCategory());
        Truth.assertThat(esRecord.getAmount()).isEqualTo(record.getAmount());
        Truth.assertThat(esRecord.getTransactionMethod()).isEqualTo(record.getTransactionMethod());
        Truth.assertThat(esRecord.getTransactionDescription()).isEqualTo(record.getTransactionDescription());
        Truth.assertThat(esRecord.getUserId()).isEqualTo(String.valueOf(record.getUserId()));
        Truth.assertThat(esRecord.getAccountId()).isEqualTo(String.valueOf(record.getAccount().getId()));
        Truth.assertThat(esRecord.getTransactionTime()).isNotNull();
    }
}