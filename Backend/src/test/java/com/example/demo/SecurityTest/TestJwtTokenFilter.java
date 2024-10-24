package com.example.demo.SecurityTest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.example.demo.utility.jwt.JwtUtil;
import com.google.common.net.HttpHeaders;

@SpringBootTest
@AutoConfigureMockMvc  // 直接在测试类上使用这个注解
@Import(TestConfig.class)
public class TestJwtTokenFilter {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    public void testJwtAuthenticationTokenFilter() throws Exception {
        String jwt = jwtUtil.generateToken(1L, "johndoe", "ROLE_ADMIN");  // 确保使用 ROLE_ 前缀

        // 测试有效的 JWT token
        mockMvc.perform(MockMvcRequestBuilders.get("/users/allusers")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andDo(MockMvcResultHandlers.print());


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
