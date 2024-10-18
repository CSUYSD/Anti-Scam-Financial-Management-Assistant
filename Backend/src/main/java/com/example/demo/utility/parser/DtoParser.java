package com.example.demo.utility.parser;

import com.example.demo.model.Account;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.model.Redis.RedisUser;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.TransactionUser;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DtoParser {
    public static TransactionRecord toTransactionRecord(TransactionRecordDTO transactionRecordDTO) {
        TransactionRecord transactionRecord = new TransactionRecord();
        transactionRecord.setAmount(transactionRecordDTO.getAmount());
        transactionRecord.setCategory(transactionRecordDTO.getCategory());
        transactionRecord.setType(transactionRecordDTO.getType());
        transactionRecord.setTransactionTime(transactionRecordDTO.getTransactionTime());
        transactionRecord.setTransactionDescription(transactionRecordDTO.getTransactionDescription());
        transactionRecord.setTransactionMethod(transactionRecordDTO.getTransactionMethod());
        return transactionRecord;
    }

    public TransactionUserDTO convertTransactionUserToDTO(TransactionUser user) {
        TransactionUserDTO userDTO = setTransactionUserDTO(user);
        List<Account> accounts = user.getAccounts();
        for (Account account : accounts) {
            userDTO.getAccountName().add(account.getAccountName());
        }
        return userDTO;
    }

    public TransactionUserDTO setTransactionUserDTO(Object user) {
        TransactionUserDTO userDTO = new TransactionUserDTO();

        if (user instanceof TransactionUser transactionUser) {
            populateUserDTO(userDTO, transactionUser.getUsername(), transactionUser.getEmail(), transactionUser.getPhone(), transactionUser.getAvatar());
        } else if (user instanceof RedisUser redisUser) {
            populateUserDTO(userDTO, redisUser.getUsername(), redisUser.getEmail(), redisUser.getPhone(), redisUser.getAvatar());
        } else {
            throw new IllegalArgumentException("Unsupported user type: " + user.getClass().getName());
        }

        return userDTO;
    }

    public void populateUserDTO(TransactionUserDTO userDTO, String username, String email, String phone, String avatar) {
        userDTO.setUsername(username);
        userDTO.setEmail(email);
        userDTO.setPhone(phone);
        userDTO.setAvatar(avatar);
    }

    public static TransactionRecordDTO convertTransactionRecordToDTO(TransactionRecord record) {
        // 创建并返回一个包含所需数据的 DTO 对象
        return new TransactionRecordDTO(
                record.getType(),
                record.getCategory(),
                record.getAmount(),
                record.getTransactionMethod(),
                record.getTransactionTime(),
                record.getTransactionDescription()
        );
    }
}
