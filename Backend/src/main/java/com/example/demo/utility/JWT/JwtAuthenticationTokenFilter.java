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
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;


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
        // 对公开端点的请求不进行 JWT 验证
        if (request.getRequestURI().contains("/h2-console")
                || request.getRequestURI().equals("/signup")
                || request.getRequestURI().equals("/login")){
            filterChain.doFilter(request, response);
            return;
        }

        // 1. 提取 token
        String token = jwtUtil.extractTokenFromRequest(request);

        // 2. 验证 token
        if (token != null && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.getUserIdFromToken(token);
            UserDetails userDetails = userDetailService.loadUserById(userId);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.debug("User authenticated: " + userDetails.getUsername() + " with authorities: " + userDetails.getAuthorities());
        } else {
            logger.debug("Invalid token or no token provided");
        }
        // 5. 继续执行过滤器链
        filterChain.doFilter(request, response);
    }

}