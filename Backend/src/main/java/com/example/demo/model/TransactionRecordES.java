package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.ZonedDateTime;

@Document(indexName = "transaction_records")
@Getter
@Setter
public class TransactionRecordES {
    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String incomeOrExpense;

    @Field(type = FieldType.Text)
    private String transactionType;

    @Field(type = FieldType.Double)
    private double amount;

    @Field(type = FieldType.Keyword)
    private String transactionMethod;

    @Field(type = FieldType.Date)
    private ZonedDateTime transactionTime;

    @Field(type = FieldType.Text)
    private String transactionDescription;

    @Field(type = FieldType.Keyword)
    private String accountId;

}