//package com.example.demo.service.ES;
//
//import com.example.demo.Dao.RecordESDao;
//import com.example.demo.model.TransactionRecordES;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.data.elasticsearch.core.query.Criteria;
//import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
//
//public class RecordSearchService {
//
//    private final RecordESDao recordESDao;
//    private final ElasticsearchOperations elasticsearchOperations;
//
//    public RecordSearchService(RecordESDao recordESDao, ElasticsearchOperations elasticsearchOperations) {
//        this.recordESDao = recordESDao;
//        this.elasticsearchOperations = elasticsearchOperations;
//    }
//
//
//    // Search transactions by keyword
//    public Page<TransactionRecordES> searchTransactions(String keyword, int page, int size) {
//        PageRequest pageRequest = PageRequest.of(page, size);
//
//        if (keyword != null && !keyword.isEmpty()) {
//            return recordESDao.findByTransactionDescriptionContainingOrTransactionTypeContaining(
//                    keyword, keyword, pageRequest);
//        } else {
//            return recordESDao.findAll(pageRequest);
//        }
//    }
//
//    // Advanced search transactions by description, type, and amount range
//    public SearchHits<TransactionRecordES> advancedSearch(String description, String type, Double minAmount, Double maxAmount) {
//        CriteriaQuery query = new CriteriaQuery(new Criteria());
//
//        if (description != null && !description.isEmpty()) {
//            query.addCriteria(Criteria.where("transactionDescription").contains(description));
//        }
//        if (type != null && !type.isEmpty()) {
//            query.addCriteria(Criteria.where("transactionType").is(type));
//        }
//        if (minAmount != null && maxAmount != null) {
//            query.addCriteria(Criteria.where("amount").between(minAmount, maxAmount));
//        }
//
//        return elasticsearchOperations.search(query, TransactionRecordES.class);
//    }
//}
