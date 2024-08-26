package com.example.demo.config.Security;

import com.example.demo.utility.JWT.JwtAuthenticationTokenFilter;
import com.example.demo.utility.JWT.JwtLogoutHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.service.UserDetailService;
import com.example.demo.utility.JWT.JwtUtil;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailService userDetailService;
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;
    private final JwtLogoutHandler jwtLogoutHandler;
    @Autowired
    public SecurityConfig(
            UserDetailService userDetailService,
            JwtUtil jwtUtil,
            JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter,
            JwtLogoutHandler jwtLogoutHandler)
    {
        this.userDetailService = userDetailService;
        this.jwtUtil = jwtUtil;
        this.jwtAuthenticationTokenFilter = jwtAuthenticationTokenFilter;
        this.jwtLogoutHandler = jwtLogoutHandler;
    }

    @Bean
    @Profile("prod")
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        // 禁用 CSRF 保护
        .csrf(AbstractHttpConfigurer::disable)
        // 禁用 HTTP 头保护
        .headers(AbstractHttpConfigurer::disable)
        // 禁用表单登录
        .formLogin(AbstractHttpConfigurer::disable)
        // 禁用会话管理
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        // 添加 JWT 过滤器
        .addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class)
        // 添加注销处理器
        .logout(logout -> logout
            .logoutUrl("/api/auth/logout")
            .addLogoutHandler(jwtLogoutHandler)
            .logoutSuccessHandler((request, response, authentication) -> {
                response.setStatus(HttpServletResponse.SC_OK);
            })
        );
        // http
        //         .authorizeHttpRequests(authorize -> authorize
        //                 .anyRequest().permitAll()
        //         )
        //         .csrf(AbstractHttpConfigurer::disable)
        //         .headers(AbstractHttpConfigurer::disable)
        //         .formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userDetailService.loadUserByUsername(username);
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }
}