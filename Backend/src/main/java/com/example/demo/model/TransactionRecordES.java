 package com.example.demo.model;

 import java.time.ZonedDateTime;

 import lombok.Data;
 import org.springframework.data.annotation.Id;
 import org.springframework.data.elasticsearch.annotations.Document;
 import org.springframework.data.elasticsearch.annotations.Field;
 import org.springframework.data.elasticsearch.annotations.FieldType;

 import lombok.Getter;
 import lombok.Setter;

 @Document(indexName = "transaction_records")
 @Data
 public class TransactionRecordES {
     @Id
     private String id;

     @Field(type = FieldType.Keyword)
     private String type;

     @Field(type = FieldType.Text)
     private String category;

     @Field(type = FieldType.Double)
     private double amount;

     @Field(type = FieldType.Keyword)
     private String transactionMethod;

     @Field(type = FieldType.Date)
     private ZonedDateTime transactionTime;

     @Field(type = FieldType.Text)
     private String transactionDescription;

     @Field(type = FieldType.Keyword)
     private String userId;

     @Field(type = FieldType.Keyword)
     private String accountId;

 }