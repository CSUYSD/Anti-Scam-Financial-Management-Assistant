package com.example.demo.service.es;

import com.example.demo.repository.es.RecordESDao;
import com.example.demo.model.TransactionRecordES;
import com.example.demo.utility.GetCurrentUserInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecordSearchService {

    private final RecordESDao recordESDao;
    private final ElasticsearchOperations elasticsearchOperations;
    private final GetCurrentUserInfo getCurrentUserInfo;

    public RecordSearchService(RecordESDao recordESDao,
                               ElasticsearchOperations elasticsearchOperations,
                               GetCurrentUserInfo getCurrentUserInfo) {
        this.recordESDao = recordESDao;
        this.elasticsearchOperations = elasticsearchOperations;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }

    // general search
    public List<TransactionRecordES> searchRecords(String token, String keyword, int page, int size) {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
        String accountIdStr = String.valueOf(accountId);

        PageRequest pageRequest = PageRequest.of(page, size);
        Page<TransactionRecordES> searchResult;

        if (keyword != null && !keyword.isEmpty()) {
            searchResult = recordESDao.findByAccountIdAndTransactionDescriptionContainingOrAccountIdAndCategoryContaining(
                    accountIdStr, keyword, accountIdStr, keyword, pageRequest);
        } else {
            searchResult = recordESDao.findByAccountId(accountIdStr, pageRequest);
        }

        return searchResult.getContent();
    }

    // advanced search
    public List<TransactionRecordES> advancedSearch(
            String token,
            String description,
            String category,
            Double minAmount,
            Double maxAmount) {

        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);

        // based on：accountId
        Criteria criteria = Criteria.where("accountId").is(accountId);
        CriteriaQuery query = new CriteriaQuery(criteria);

        // other condition
        if (description != null && !description.isEmpty()) {
            query.addCriteria(Criteria.where("transactionDescription").contains(description));
        }
        if (category != null && !category.isEmpty()) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (minAmount != null && maxAmount != null) {
            query.addCriteria(Criteria.where("amount").between(minAmount, maxAmount));
        }

        // transfer SearchHits to List<TransactionRecordES>
        return elasticsearchOperations.search(query, TransactionRecordES.class)
                .stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }
}