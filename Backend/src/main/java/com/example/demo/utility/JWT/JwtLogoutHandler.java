package com.example.demo.utility.JWT;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
        String redisKey = "login:" + userId;
        redisTemplate.delete(redisKey);
        if (token != null) {
            jwtUtil.invalidateToken(token);
        }
    }
}