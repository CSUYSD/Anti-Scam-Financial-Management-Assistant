package com.example.demo.controller;

import com.example.demo.controller.AccountController;
import com.example.demo.exception.AccountAlreadyExistException;
import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.model.dto.AccountDTO;
import com.example.demo.service.AccountService;
import com.example.demo.utility.jwt.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AccountControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AccountService accountService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @InjectMocks
    private AccountController accountController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(accountController).build();
    }

    @Test
    public void testGetAllAccountsByUserId() throws Exception, UserNotFoundException {
        String token = "Bearer testToken";
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        when(accountService.getAllAccountsByUserId(anyString())).thenReturn(List.of(new Account()));

        MvcResult result = mockMvc.perform(get("/account/all")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    public void testCreateAccount() throws Exception, UserNotFoundException {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("TestAccount");
        String requestBody = new ObjectMapper().writeValueAsString(accountDTO);

        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        when(accountService.createAccount(any(AccountDTO.class), anyLong())).thenReturn("Account created");

        MvcResult result = mockMvc.perform(post("/account/create")
                        .header("Authorization", "Bearer testToken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("Account created");
    }

    @Test
    public void testCreateAccount_AccountAlreadyExists() throws Exception, UserNotFoundException {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("TestAccount");  // 确保字段不为空
        String requestBody = new ObjectMapper().writeValueAsString(accountDTO);

        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        doThrow(new AccountAlreadyExistException("User already exists")).when(accountService)
                .createAccount(any(AccountDTO.class), anyLong());

        MvcResult result = mockMvc.perform(post("/account/create")
                        .header("Authorization", "Bearer testToken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andReturn();

        // 使用UTF-8编码来解析response
        String content = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(content).isEqualTo("User already exists");
    }






    @Test
    public void testGetAccountByAccountId() throws Exception {
        String token = "Bearer testToken";
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);

        ValueOperations valueOpsMock = mock(ValueOperations.class);
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOpsMock);
        when(valueOpsMock.get(anyString())).thenReturn("1"); // Mock Redis value retrieval

        when(accountService.getAccountByAccountId(1L)).thenReturn(new Account());

        MvcResult result = mockMvc.perform(get("/account/current")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    public void testUpdateAccount() throws Exception {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("UpdatedAccount");
        String requestBody = new ObjectMapper().writeValueAsString(accountDTO);

        when(accountService.updateAccount(anyLong(), any(AccountDTO.class))).thenReturn(new Account());

        MvcResult result = mockMvc.perform(put("/account/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    public void testDeleteAccount() throws Exception {
        doNothing().when(accountService).deleteAccount(anyLong());

        MvcResult result = mockMvc.perform(delete("/account/1"))
                .andExpect(status().isNoContent())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.NO_CONTENT.value());
    }


    @Test
    public void testSwitchAccount() throws Exception {
        String token = "Bearer testToken";
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        doNothing().when(accountService).setCurrentAccountToRedis(anyLong(), anyLong());

        MvcResult result = mockMvc.perform(get("/account/switch")
                        .param("accountId", "1")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
    }
}