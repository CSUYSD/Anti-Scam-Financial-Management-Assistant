package com.example.demo.service.es;

import com.example.demo.model.TransactionRecordES;
import com.example.demo.repository.es.RecordESDao;
import com.example.demo.utility.GetCurrentUserInfo;
import com.google.common.truth.Truth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;

import java.util.Arrays;
import java.util.List;

public class RecordSearchServiceTest {

    private RecordSearchService recordSearchService;

    @Mock
    private RecordESDao recordESDao;

    @Mock
    private ElasticsearchOperations elasticsearchOperations;

    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        recordSearchService = new RecordSearchService(recordESDao, elasticsearchOperations, getCurrentUserInfo);
    }

    @Test
    public void testSearchRecordsWithKeyword() throws Exception {
        // Arrange
        String token = "test-token";
        String keyword = "food";
        int page = 0;
        int size = 10;
        Long userId = 1L;
        Long accountId = 1L;
        String accountIdStr = String.valueOf(accountId);

        List<TransactionRecordES> expectedRecords = Arrays.asList(createTestESRecord());
        Page<TransactionRecordES> mockPage = new PageImpl<>(expectedRecords);

        Mockito.when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        Mockito.when(getCurrentUserInfo.getCurrentAccountId(userId)).thenReturn(accountId);
        Mockito.when(recordESDao.findByAccountIdAndTransactionDescriptionContainingOrAccountIdAndCategoryContaining(
                        accountIdStr, keyword, accountIdStr, keyword, PageRequest.of(page, size)))
                .thenReturn(mockPage);

        // Act
        List<TransactionRecordES> result = recordSearchService.searchRecords(token, keyword, page, size);

        // Assert
        Truth.assertThat(result).hasSize(1);
        Truth.assertThat(result.get(0).getTransactionDescription()).contains("food");
        System.out.println("testSearchRecordsWithKeyword passed!");
    }

    @Test
    public void testSearchRecordsWithoutKeyword() throws Exception {
        // Arrange
        String token = "test-token";
        String keyword = null;
        int page = 0;
        int size = 10;
        Long userId = 1L;
        Long accountId = 1L;
        String accountIdStr = String.valueOf(accountId);

        List<TransactionRecordES> expectedRecords = Arrays.asList(createTestESRecord());
        Page<TransactionRecordES> mockPage = new PageImpl<>(expectedRecords);

        Mockito.when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        Mockito.when(getCurrentUserInfo.getCurrentAccountId(userId)).thenReturn(accountId);
        Mockito.when(recordESDao.findByAccountId(accountIdStr, PageRequest.of(page, size)))
                .thenReturn(mockPage);

        // Act
        List<TransactionRecordES> result = recordSearchService.searchRecords(token, keyword, page, size);

        // Assert
        Truth.assertThat(result).hasSize(1);
        System.out.println("testSearchRecordsWithoutKeyword passed!");
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testAdvancedSearch() throws Exception {
        // Arrange
        String token = "test-token";
        String description = "food";
        String category = "lunch";
        Double minAmount = 10.0;
        Double maxAmount = 50.0;
        Long userId = 1L;
        Long accountId = 1L;

        TransactionRecordES testRecord = createTestESRecord();
        List<TransactionRecordES> expectedRecords = List.of(testRecord);  // 使用 List.of 替代 Arrays.asList

        // 创建模拟的 SearchHits 对象
        SearchHits<TransactionRecordES> mockSearchHits = Mockito.mock(SearchHits.class);

        // 设置 SearchHits 的行为
        Mockito.when(mockSearchHits.stream())
                .thenAnswer(invocation -> expectedRecords.stream().map(record -> {
                    SearchHit<TransactionRecordES> hit = Mockito.mock(SearchHit.class);
                    Mockito.when(hit.getContent()).thenReturn(record);
                    return hit;
                }));

        Mockito.when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        Mockito.when(getCurrentUserInfo.getCurrentAccountId(userId)).thenReturn(accountId);

        // 修改 mock 设置，返回模拟的 SearchHits
        Mockito.when(elasticsearchOperations.search(
                (CriteriaQuery) Mockito.any(),
                Mockito.eq(TransactionRecordES.class)
        )).thenReturn(mockSearchHits);

        // Act
        List<TransactionRecordES> result = recordSearchService.advancedSearch(
                token, description, category, minAmount, maxAmount);

        // Assert
        Truth.assertThat(result).hasSize(1);
        Truth.assertThat(result.get(0).getTransactionDescription()).contains("food");
        System.out.println("testAdvancedSearch passed!");
    }

    private TransactionRecordES createTestESRecord() {
        TransactionRecordES record = new TransactionRecordES();
        record.setId("1");
        record.setType("EXPENSE");
        record.setCategory("lunch");
        record.setAmount(25.0);
        record.setTransactionMethod("Cash");
        record.setTransactionDescription("food expense");
        record.setUserId("1");
        record.setAccountId("1");
        return record;
    }
}