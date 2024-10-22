package com.example.demo.utility;

import com.example.demo.model.TransactionUser;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class GetCurrentUserInfo {
    public final JwtUtil jwtUtil;
    public final StringRedisTemplate stringRedisTemplate;
    private final TransactionUserDao transactionUserDao;

    @Autowired
    public GetCurrentUserInfo(JwtUtil jwtUtil, StringRedisTemplate stringRedisTemplate, TransactionUserDao transactionUserDao) {
        this.jwtUtil = jwtUtil;
        this.stringRedisTemplate = stringRedisTemplate;
        this.transactionUserDao = transactionUserDao;
    }


    public Long getCurrentUserId(String token) {
        return jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
    }

    public Long getCurrentAccountId(Long userId) {
        try {
            String pattern = "login_user:" + userId.toString() + ":current_account";
            String accountId = stringRedisTemplate.opsForValue().get(pattern);
            System.out.printf("===============================accountId: %s===============================", accountId);
            return Long.valueOf(accountId);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
            System.out.println(Arrays.toString(e.getStackTrace()));
            return null;
        }
    }

    public TransactionUser getCurrentUserEntity(String token){
        Long userId = getCurrentUserId(token);
        return transactionUserDao.findById(userId).get();
    }

    public Object getCurrentUserRole(String token) {
        return jwtUtil.getRoleFromToken(token.replace("Bearer ", ""));
    }
}
