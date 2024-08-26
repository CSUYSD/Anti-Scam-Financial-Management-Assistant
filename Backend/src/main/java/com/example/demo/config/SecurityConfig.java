package com.example.demo.config;

import com.example.demo.service.impl.UserServiceImpl;
import com.example.demo.utility.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserServiceImpl userServiceImpl;
    private final JwtUtil jwtUtil;
    @Autowired
    public SecurityConfig(UserServiceImpl userServiceImpl, JwtUtil jwtUtil) {
        this.userServiceImpl = userServiceImpl;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    @Profile("dev")
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        // 配置HttpSecurity
//        http
//                .authorizeHttpRequests(authorize -> authorize
//                        .requestMatchers("/h2-console/**", "users/signup", "login").permitAll() // 允许访问H2控制台
//                        .anyRequest().authenticated() // 其他请求需要认证
//                )
//                .csrf(csrf -> csrf.ignoringRequestMatchers("/h2-console/**", "users/signup", "login")) // 禁用H2控制台的CSRF保护
//                .headers(AbstractHttpConfigurer::disable) // 允许H2控制台页面使用iframe
//                .formLogin(AbstractHttpConfigurer::disable); // 禁用默认的表单登录

        //开发环境中的配置：允许所有端点的权限
        http
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .headers(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userServiceImpl).passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }
}