package com.example.demo.model.Redis;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class RedisRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id; // 交易记录的ID
    private String type; // 收入或支出
    private String transactionType; // 交易类型
    private Double amount; // 金额
    private String transactionMethod; // 支付方式
    private ZonedDateTime transactionTime; // 交易时间
    private String transactionDescription; // 交易描述
    private Long accountId; // 对应账户的ID

    public RedisRecord(Long id, String type, String transactionType, Double amount,
                       String transactionMethod, ZonedDateTime transactionTime,
                       String transactionDescription, Long accountId) {
        this.id = id;
        this.type = type;
        this.transactionType = transactionType;
        this.amount = amount;
        this.transactionMethod = transactionMethod;
        this.transactionTime = transactionTime;
        this.transactionDescription = transactionDescription;
        this.accountId = accountId;
    }
}