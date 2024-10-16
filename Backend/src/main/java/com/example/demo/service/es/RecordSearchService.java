package com.example.demo.service.es;

import com.example.demo.repository.ESDao.RecordESDao;
import com.example.demo.model.TransactionRecordES;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecordSearchService {

    private final RecordESDao recordESDao;
    private final ElasticsearchOperations elasticsearchOperations;

    public RecordSearchService(RecordESDao recordESDao, ElasticsearchOperations elasticsearchOperations) {
        this.recordESDao = recordESDao;
        this.elasticsearchOperations = elasticsearchOperations;
    }


    // Search transactions by keyword
    public List<TransactionRecordES> searchRecords(String keyword, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<TransactionRecordES> searchResult;

        if (keyword != null && !keyword.isEmpty()) {
            searchResult = recordESDao.findByTransactionDescriptionContainingOrCategoryContaining(
                    keyword, keyword, pageRequest);
        } else {
            searchResult = recordESDao.findAll(pageRequest);
        }

        return searchResult.getContent();
    }

    // Advanced search transactions by description, category, and amount range
    public SearchHits<TransactionRecordES> advancedSearch(String description, String category, Double minAmount, Double maxAmount) {
        CriteriaQuery query = new CriteriaQuery(new Criteria());

        if (description != null && !description.isEmpty()) {
            query.addCriteria(Criteria.where("transactionDescription").contains(description));
        }
        if (category != null && !category.isEmpty()) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (minAmount != null && maxAmount != null) {
            query.addCriteria(Criteria.where("amount").between(minAmount, maxAmount));
        }

        return elasticsearchOperations.search(query, TransactionRecordES.class);
    }
}
