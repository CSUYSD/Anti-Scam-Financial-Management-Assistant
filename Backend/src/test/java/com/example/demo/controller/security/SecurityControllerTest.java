package com.example.demo.controller.security;

import com.example.demo.controller.security.SecurityController;
import com.example.demo.exception.PasswordNotCorrectException;
import com.example.demo.exception.UserAlreadyExistsException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.model.security.LoginVo;
import com.example.demo.service.security.SecurityService;
import com.example.demo.service.security.UserDetailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class SecurityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SecurityService securityService;

    @Mock
    private UserDetailService userDetailService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private SecurityController securityController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(securityController).build();
    }

    @Test
    public void testLogin() throws Exception {
        // Create test data
        LoginVo loginVo = new LoginVo();
        loginVo.setUsername("testUser");
        loginVo.setPassword("Password123!");

        // Convert DTO to JSON
        String requestBody = new ObjectMapper().writeValueAsString(loginVo);

        // Simulate the service layer returning a successful login response
        ResponseEntity<?> responseEntity = ResponseEntity.ok("Login successful");
        when(securityService.login(any(LoginVo.class))).thenReturn((ResponseEntity<Map<String, Object>>) responseEntity);

        // Execute the request using MockMvc
        MvcResult result = mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("Login successful");
    }

    @Test
    public void testCreateUser() throws Exception {
        // Create test user data
        TransactionUserDTO transactionUserDTO = new TransactionUserDTO();
        transactionUserDTO.setUsername("testUser");
        transactionUserDTO.setPassword("Password123!");
        transactionUserDTO.setEmail("testuser@example.com");

        // Convert DTO to JSON
        String requestBody = new ObjectMapper().writeValueAsString(transactionUserDTO);

        // Simulate service layer behavior for successful user creation
        doNothing().when(securityService).saveUser(any(TransactionUserDTO.class));

        // Execute the MockMvc request and assert the result
        MvcResult result = mockMvc.perform(post("/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.CREATED.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("User created successfully");
    }

    @Test
    public void testCreateUser_UserAlreadyExists() throws Exception {
        // Create test user data
        TransactionUserDTO transactionUserDTO = new TransactionUserDTO();
        transactionUserDTO.setUsername("testUser");
        transactionUserDTO.setPassword("Password123!");
        transactionUserDTO.setEmail("testuser@example.com");

        // Convert DTO to JSON
        String requestBody = new ObjectMapper().writeValueAsString(transactionUserDTO);

        // Simulate service layer throwing UserAlreadyExistsException for void method
        doThrow(new UserAlreadyExistsException("User already exists"))
                .when(securityService).saveUser(any(TransactionUserDTO.class));

        // Execute the MockMvc request and assert the result
        MvcResult result = mockMvc.perform(post("/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("User already exists");
    }

    @Test
    public void testUpdatePassword() throws Exception, UserNotFoundException {
        // Create test data for old and new passwords
        Map<String, String> oldAndNewPwd = new HashMap<>();
        oldAndNewPwd.put("oldPassword", "oldPass123");
        oldAndNewPwd.put("newPassword", "newPass123");

        // Convert Map to JSON
        String requestBody = new ObjectMapper().writeValueAsString(oldAndNewPwd);

        // Simulate service layer behavior for password update
        doNothing().when(securityService).updatePassword(any(String.class), any(Map.class));

        // Execute the MockMvc request and assert the result
        MvcResult result = mockMvc.perform(patch("/updatePwd")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer testToken")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("Password updated successfully");
    }

    @Test
    public void testUpdatePassword_UserNotFound() throws Exception, UserNotFoundException {
        // Create test data for old and new passwords
        Map<String, String> oldAndNewPwd = new HashMap<>();
        oldAndNewPwd.put("oldPassword", "oldPass123");
        oldAndNewPwd.put("newPassword", "newPass123");

        // Convert Map to JSON
        String requestBody = new ObjectMapper().writeValueAsString(oldAndNewPwd);

        // Simulate service layer throwing UserNotFoundException
        doThrow(new UserNotFoundException("User not found"))
                .when(securityService).updatePassword(any(String.class), any(Map.class));


        // Execute the MockMvc request and assert the result
        MvcResult result = mockMvc.perform(patch("/updatePwd")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer testToken")
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("User not found");
    }

    @Test
    public void testUpdatePassword_PasswordNotCorrect() throws Exception, UserNotFoundException {
        // Create test data for old and new passwords
        Map<String, String> oldAndNewPwd = new HashMap<>();
        oldAndNewPwd.put("oldPassword", "oldPass123");
        oldAndNewPwd.put("newPassword", "newPass123");

        // Convert Map to JSON
        String requestBody = new ObjectMapper().writeValueAsString(oldAndNewPwd);

        // Simulate service layer throwing PasswordNotCorrectException
        doThrow(new PasswordNotCorrectException("Old password is not correct"))
                .when(securityService).updatePassword(any(String.class), any(Map.class));


        // Execute the MockMvc request and assert the result
        MvcResult result = mockMvc.perform(patch("/updatePwd")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer testToken")
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        // Assert the status and response content using Google Truth
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(result.getResponse().getContentAsString()).isEqualTo("Old password is not correct");
    }
}