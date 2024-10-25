package com.example.demo.service;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

import com.example.demo.model.Account;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.repository.AccountDao;
import com.example.demo.repository.TransactionRecordDao;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.service.es.RecordSyncService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.jwt.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class TransactionRecordServiceTest {

    private TransactionRecordService transactionRecordService;

    @Mock private TransactionRecordDao transactionRecordDao;
    @Mock private TransactionUserDao transactionUserDao;
    @Mock private AccountDao accountDao;
    @Mock private RecordSyncService recordSyncService;
    @Mock private JwtUtil jwtUtil;
    @Mock private RedisTemplate<String, Object> redisTemplate;
    @Mock private GetCurrentUserInfo getCurrentUserInfo;
    @Mock private RabbitMQService rabbitMQService;
    @Mock private RabbitTemplate rabbitTemplate;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private ValueOperations<String, Object> valueOperations;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        transactionRecordService = new TransactionRecordService(
                transactionRecordDao, jwtUtil, redisTemplate, accountDao,
                transactionUserDao, recordSyncService, getCurrentUserInfo,
                rabbitMQService, rabbitTemplate
        );
    }

    @Test
    public void getAllRecordsByAccountId_ShouldReturnRecordsList() {
        // Arrange
        Long accountId = 1L;
        List<TransactionRecord> expectedRecords = Arrays.asList(
                createTestRecord(1L, "expense", 100.0),
                createTestRecord(2L, "income", 200.0)
        );
        when(transactionRecordDao.findAllByAccountId(accountId)).thenReturn(expectedRecords);

        // Act
        List<TransactionRecord> result = transactionRecordService.getAllRecordsByAccountId(accountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyElementsIn(expectedRecords);
    }

    @Test
    public void addTransactionRecord_ExpenseType_ShouldUpdateAccountExpense() {
        // Arrange
        String token = "Bearer test-token";
        Long userId = 1L;
        Long accountId = 1L;
        TransactionRecordDTO dto = createTestRecordDTO("expense", 100.0);
        dto.setTransactionTime(ZonedDateTime.now()); // 添加时间

        TransactionUser user = new TransactionUser();
        user.setId(userId);

        Account account = createTestAccount(accountId, 0.0, 0.0);
        account.setTransactionUser(user); // 设置用户

        when(jwtUtil.getUserIdFromToken("test-token")).thenReturn(userId);
        when(getCurrentUserInfo.getCurrentAccountId(userId)).thenReturn(accountId);
        when(accountDao.findById(accountId)).thenReturn(Optional.of(account));

        // Act
        transactionRecordService.addTransactionRecord(token, dto);

        // Assert
        assertThat(account.getTotalExpense()).isEqualTo(100.0);
        verify(transactionRecordDao).save(any(TransactionRecord.class));
        verify(recordSyncService).syncToElasticsearch(any(TransactionRecord.class));
    }

    @Test
    public void updateTransactionRecord_ShouldUpdateAmounts() {
        // Arrange
        Long recordId = 1L;
        TransactionRecordDTO newDto = createTestRecordDTO("income", 150.0);
        TransactionRecord existingRecord = createTestRecord(recordId, "expense", 100.0);

        TransactionUser user = new TransactionUser();
        user.setId(1L);

        Account account = createTestAccount(1L, 200.0, 100.0);
        account.setTransactionUser(user); // 设置用户
        existingRecord.setAccount(account);

        when(transactionRecordDao.findById(recordId)).thenReturn(Optional.of(existingRecord));
        when(accountDao.findById(account.getId())).thenReturn(Optional.of(account));

        // Act
        transactionRecordService.updateTransactionRecord(recordId, newDto);

        // Assert
        assertThat(account.getTotalExpense()).isEqualTo(0.0);
        assertThat(account.getTotalIncome()).isEqualTo(350.0);
        verify(transactionRecordDao).save(any(TransactionRecord.class));
        verify(recordSyncService).updateInElasticsearch(any(TransactionRecord.class));
    }

    @Test
    public void deleteTransactionRecord_ShouldUpdateAccountBalance() {
        // Arrange
        Long recordId = 1L;
        TransactionUser user = new TransactionUser();
        user.setId(1L);

        Account account = createTestAccount(1L, 200.0, 100.0);
        account.setTransactionUser(user); // 设置用户

        TransactionRecord record = createTestRecord(recordId, "expense", 50.0);
        record.setAccount(account);

        when(transactionRecordDao.findById(recordId)).thenReturn(Optional.of(record));
        when(accountDao.findById(account.getId())).thenReturn(Optional.of(account));

        // Act
        transactionRecordService.deleteTransactionRecord(recordId);

        // Assert
        assertThat(account.getTotalExpense()).isEqualTo(50.0);
        verify(transactionRecordDao).delete(record);
        verify(recordSyncService).deleteFromElasticsearch(recordId);
    }


    @Test
    public void findRecordByAccountIdAndType_ShouldReturnFilteredRecords() {
        // Arrange
        Long accountId = 1L;
        String type = "expense";
        List<TransactionRecord> expectedRecords = Arrays.asList(
                createTestRecord(1L, "expense", 100.0),
                createTestRecord(2L, "expense", 150.0)
        );

        when(transactionRecordDao.findByAccountIdAndType(type, accountId)).thenReturn(expectedRecords);

        // Act
        List<TransactionRecord> result = transactionRecordService.findRecordByAccountIdAndType(type, accountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyElementsIn(expectedRecords);
    }

    @Test
    public void getCertainDaysRecords_ShouldReturnRecordsWithinDuration() {
        // Arrange
        Long accountId = 1L;
        Integer duration = 7;
        List<TransactionRecord> records = Arrays.asList(
                createTestRecord(1L, "expense", 100.0),
                createTestRecord(2L, "income", 200.0)
        );

        when(transactionRecordDao.findCertainDaysRecords(accountId, duration)).thenReturn(records);

        // Act
        List<TransactionRecordDTO> result = transactionRecordService.getCertainDaysRecords(accountId, duration);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    private TransactionRecord createTestRecord(Long id, String type, Double amount) {
        TransactionRecord record = new TransactionRecord();
        record.setId(id);
        record.setType(type);
        record.setAmount(amount);
        return record;
    }

    private TransactionRecordDTO createTestRecordDTO(String type, Double amount) {
        TransactionRecordDTO dto = new TransactionRecordDTO();
        dto.setType(type);
        dto.setAmount(amount);
        return dto;
    }

    private Account createTestAccount(Long id, Double income, Double expense) {
        Account account = new Account();
        account.setId(id);
        account.setTotalIncome(income);
        account.setTotalExpense(expense);
        return account;
    }
}