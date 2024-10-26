package com.example.demo.controller;

import com.example.demo.controller.TransactionRecordController;
import com.example.demo.model.TransactionRecord;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.utility.jwt.JwtUtil;
import com.jayway.jsonpath.JsonPath;
import org.joda.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.ZonedDateTime;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


public class TransactionRecordControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TransactionRecordService recordService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private TransactionRecordController transactionRecordController;

    private ZonedDateTime zonedDateTime;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(transactionRecordController).build();

        // Mock Redis template operations
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    public void testGetAllRecordByAccountId_Success() throws Exception {
        // Mock Redis to return a valid accountId
        when(stringRedisTemplate.opsForValue().get(anyString())).thenReturn("1");

        // Mock the service call
        TransactionRecord record = new TransactionRecord();
        record.setId(1L);
        record.setType("INCOME");
        record.setCategory("Salary");
        record.setAmount(100.00);  // use Double
        record.setTransactionTime(ZonedDateTime.now());
        record.setTransactionDescription("Salary for September");
        record.setUserId(1L);
        record.setTransactionMethod("Bank Transfer");

        List<TransactionRecord> records = List.of(record);
        when(recordService.getAllRecordsByAccountId(anyLong())).thenReturn(records);

        // Perform the request
        MvcResult result = mockMvc.perform(get("/records/all")
                        .header("Authorization", "Bearer testToken")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // Parse the JSON response
        String jsonResponse = result.getResponse().getContentAsString();

        // Use JsonPath to extract values
        String amount = JsonPath.parse(jsonResponse).read("$[0].amount").toString();
        String type = JsonPath.parse(jsonResponse).read("$[0].type").toString();
        String description = JsonPath.parse(jsonResponse).read("$[0].transactionDescription").toString();

        // Convert both to a common format
        double expectedAmount = Double.parseDouble("100.00");
        double actualAmount = Double.parseDouble(amount);

        // Assert using Google Truth
        assertThat(actualAmount).isEqualTo(expectedAmount);  // Compare double values
        assertThat(type).isEqualTo("INCOME");
        assertThat(description).contains("Salary for September");
    }






    @Test
    public void testAddTransactionRecord_Success() throws Exception {
        TransactionRecordDTO recordDTO = new TransactionRecordDTO();
        recordDTO.setAmount(200.00);

        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);

        MvcResult result = mockMvc.perform(post("/records/create")
                        .header("Authorization", "Bearer testToken")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 200.00}"))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(201);
        assertThat(result.getResponse().getContentAsString()).contains("Transaction record has been created successfully.");
    }

    @Test
    public void testUpdateTransactionRecord_Success() throws Exception {
        TransactionRecordDTO recordDTO = new TransactionRecordDTO();
        recordDTO.setAmount(150.00);

        MvcResult result = mockMvc.perform(put("/records/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 150.00}"))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(result.getResponse().getContentAsString()).contains("Transaction record updated successfully.");
    }

    @Test
    public void testDeleteTransactionRecord_Success() throws Exception {
        MvcResult result = mockMvc.perform(delete("/records/delete/1"))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(result.getResponse().getContentAsString()).contains("Transaction record deleted successfully.");
    }

    @Test
    public void testGetRecordsByAccountIdAndType_Success() throws Exception {
        // Setup the mock data
        TransactionRecord record = new TransactionRecord();
        record.setAmount(50.00);  // Double value for amount
        List<TransactionRecord> records = List.of(record);

        // Mock the behavior of dependencies
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        when(valueOperations.get(anyString())).thenReturn("1");
        when(recordService.findRecordByAccountIdAndType("INCOME", 1L)).thenReturn(records);

        // Perform the GET request
        MvcResult result = mockMvc.perform(get("/records/by-type/income")
                        .header("Authorization", "Bearer testToken")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // Parse the JSON response
        String jsonResponse = result.getResponse().getContentAsString();

        // Extract the amount from the response using JsonPath
        String amount = JsonPath.parse(jsonResponse).read("$[0].amount").toString();

        // Convert both to a common format and assert
        double expectedAmount = 50.00;
        double actualAmount = Double.parseDouble(amount);
        assertThat(actualAmount).isEqualTo(expectedAmount);  // Compare the double values

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
    }


    @Test
    public void testGetCertainDaysRecord_Success() throws Exception {
        // Setup the mock data
        TransactionRecordDTO recordDTO = new TransactionRecordDTO();
        recordDTO.setAmount(120.00);  // Double value for amount
        List<TransactionRecordDTO> records = List.of(recordDTO);

        // Mock the behavior of dependencies
        when(jwtUtil.getUserIdFromToken(anyString())).thenReturn(1L);
        when(valueOperations.get(anyString())).thenReturn("1");
        when(recordService.getCertainDaysRecords(1L, 7)).thenReturn(records);

        // Perform the GET request
        MvcResult result = mockMvc.perform(get("/records/recent")
                        .header("Authorization", "Bearer testToken")
                        .param("duration", "7")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // Parse the JSON response
        String jsonResponse = result.getResponse().getContentAsString();

        // Extract the amount from the response using JsonPath
        String amount = JsonPath.parse(jsonResponse).read("$[0].amount").toString();

        // Convert both to a common format and assert
        double expectedAmount = 120.00;
        double actualAmount = Double.parseDouble(amount);
        assertThat(actualAmount).isEqualTo(expectedAmount);  // Compare the double values

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
    }

}