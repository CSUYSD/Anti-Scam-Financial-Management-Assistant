package com.example.demo.SecurityTest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.net.HttpHeaders;

@AutoConfigureMockMvc
@SpringBootTest
public class TestJwtTokenFilter {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testJwtAuthenticationTokenFilter() throws Exception {
        // 创建一个有效的JWT
        Long userId = 1L;
        String username = "johndoe";
        String jwt = jwtUtil.generateToken(userId, username, "ROLE_ADMIN");

    // 发送一个带有JWT的请求
    mockMvc.perform(MockMvcRequestBuilders.get("/users/allusers")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt))
            .andExpect(MockMvcResultMatchers.status().isOk());
    // 发送一个不带JWT的请求
    mockMvc.perform(MockMvcRequestBuilders.get("/users/allusers"))
            .andExpect(MockMvcResultMatchers.status().isUnauthorized());

    // 发送一个带有无效JWT的请求
    String invalidJwt = "invalid.jwt.token";
    mockMvc.perform(MockMvcRequestBuilders.get("/users/allusers")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidJwt))
            .andExpect(MockMvcResultMatchers.status().isUnauthorized());
}   
}
