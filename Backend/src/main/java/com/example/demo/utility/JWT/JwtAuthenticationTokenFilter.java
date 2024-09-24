package com.example.demo.utility.JWT;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.service.Security.UserDetailService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
                || request.getRequestURI().equals("/login")
                || request.getRequestURI().contains("/message")
                || request.getRequestURI().contains("/document")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 确保从请求头中提取 token 时去除了可能的前缀（如 "Bearer "）和多余的空格
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        // 2. 验证 token
        if (token != null && jwtUtil.validateToken(token)) {

            // 3. 从 token 中提取用户信息
            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            UserDetails userDetails = userDetailService.loadUserById(userId);
            // 在过滤时直接从token获取用户的角色信息，直接授权，绕开从userdetail里获取role info
            Collection<? extends GrantedAuthority> authorities =
                Collections.singletonList(new SimpleGrantedAuthority(role));

            // 4. 将用户信息存入 SecurityContext，在后续的请求中可以直接获取用户信息
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid token");
            return;
        }
        // 5. 继续执行过滤器链
        filterChain.doFilter(request, response);
    }

}