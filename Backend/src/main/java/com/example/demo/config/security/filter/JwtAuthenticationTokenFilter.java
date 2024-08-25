package com.example.demo.config.security.filter;

import com.example.demo.model.LoginUser;
import com.example.demo.utility.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.annotation.Resource;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    @Resource(name = "myRedisTemplate")
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader("token");
        if (!StringUtils.hasText(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userid;
        try {
            Claims claims = jwtUtil.parseJWT(token);
            userid = claims.getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }

        String redisKey = "login:" + userid;
        LoginUser loginUser = (LoginUser) redisTemplate.opsForValue().get(redisKey);
        if(Objects.isNull(loginUser)) {
            throw new RuntimeException("User not logged in");
        }

        // 验证token是否匹配
        if (!token.equals(loginUser.getToken())) {
            throw new RuntimeException("Token mismatch");
        }

        // 检查是否过期
        if (System.currentTimeMillis() > loginUser.getExpireTime()) {
            redisTemplate.delete(redisKey);
            throw new RuntimeException("Login expired");
        }

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginUser, null, null);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        filterChain.doFilter(request, response);
    }

}
