// package com.example.demo.Dao.ESDao;

// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import com.example.demo.model.TransactionRecordES;
// import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
// import org.springframework.stereotype.Repository;

// @Repository
// public interface RecordESDao extends ElasticsearchRepository<TransactionRecordES, String> {
//     Page<TransactionRecordES> findByTransactionDescriptionContainingOrTransactionTypeContaining(
//             String description, String type, Pageable pageable);
// }