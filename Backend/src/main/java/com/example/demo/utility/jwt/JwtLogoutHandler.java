package com.example.demo.utility.jwt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashSet;
import java.util.Set;

@Component
public class JwtLogoutHandler implements LogoutHandler {

    private final JwtUtil jwtUtil;

    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public JwtLogoutHandler(JwtUtil jwtUtil, RedisTemplate<String, Object> redisTemplate) {
        this.jwtUtil = jwtUtil;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String token = jwtUtil.extractTokenFromRequest(request);
        Long userId = jwtUtil.getUserIdFromToken(token);
        String keyPattern = "login_user:" + userId + ":*";
        Set<String> keys = redisTemplate.execute((RedisCallback<Set<String>>) connection -> {
            Set<String> keySet = new HashSet<>();

            Cursor<byte[]> cursor = connection.scan(ScanOptions.scanOptions().match(keyPattern).build());
            while (cursor.hasNext()) {
                keySet.add(new String(cursor.next()));
            }
            return keySet;
        });

        // 删除找到的所有 keys
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
        if (token != null) {
            jwtUtil.invalidateToken(token);
        }
    }
}