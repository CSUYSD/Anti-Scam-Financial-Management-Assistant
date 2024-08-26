package com.example.demo.utility.JWT;

import com.example.demo.service.UserDetailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.Objects;

@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailService userDetailService;
    @Autowired
    public JwtAuthenticationTokenFilter(JwtUtil jwtUtil, UserDetailService userDetailService) {
        this.jwtUtil = jwtUtil;
        this.userDetailService = userDetailService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        // 1. 提取 token
        String token = jwtUtil.extractTokenFromRequest(request);

        // 2. 验证 token
        if (token != null && jwtUtil.validateToken(token)) {

            // 3. 从 token 中提取用户信息
            Long userId = jwtUtil.getUserIdFromToken(token);

            UserDetails userDetails = userDetailService.loadUserById(userId);

            // 4. 将用户信息存入 SecurityContext，在后续的请求中可以直接获取用户信息
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        // 5. 继续执行过滤器链
        filterChain.doFilter(request, response);
    }

}