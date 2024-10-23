package com.example.demo.SecurityTest;

import com.example.demo.controller.ai.AiAnalyserController;
import com.example.demo.service.ai.AiAnalyserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.when;

public class AiAnalyserControllerTest {

    @Mock
    private AiAnalyserService aiAnalyserService;

    @InjectMocks
    private AiAnalyserController aiAnalyserController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGenerateOverAllFinancialReport() {
        String token = "Bearer testToken";
        String expectedReport = "Financial Report Content";

        // Mock the service call
        when(aiAnalyserService.generateOverAllFinancialReport(token)).thenReturn(expectedReport);

        // Call the controller method
        ResponseEntity<String> response = aiAnalyserController.generateOverAllFinancialReport(token);

        // Assert the response
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedReport);
    }
}