package com.example.demo.SecurityTest;

import com.example.demo.model.message.AnalyseRequest;
import com.example.demo.service.rabbitmq.RabbitMQService;
import groovy.util.logging.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.*;

@Slf4j
class RabbitMQServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private RabbitMQService rabbitMQService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSendAnalyseRequestToAIAnalyserSuccess() {
        // Arrange
        AnalyseRequest request = new AnalyseRequest();
        request.setAccountId(1L);
        request.setContent("Test content");

        // Act
        rabbitMQService.sendAnalyseRequestToAIAnalyser(request);

        // Assert using Google Truth
        verify(rabbitTemplate, times(1)).convertAndSend("new.record.to.ai.analyser", request);
        assertThat(request.getAccountId()).isEqualTo(1L);
        assertThat(request.getContent()).isEqualTo("Test content");
    }

    @Test
    void testSendAnalyseRequestToAIAnalyserFailure() {
        // Arrange
        AnalyseRequest request = new AnalyseRequest();
        request.setAccountId(1L);
        request.setContent("Test content");

        doThrow(new RuntimeException("RabbitMQ error")).when(rabbitTemplate).convertAndSend(anyString(), any(AnalyseRequest.class));

        // Act and Assert
        try {
            rabbitMQService.sendAnalyseRequestToAIAnalyser(request);
        } catch (RuntimeException e) {
            assertThat(e).hasMessageThat().contains("RabbitMQ error");
        }

        // Verify that exception was thrown and logged
        verify(rabbitTemplate, times(1)).convertAndSend("new.record.to.ai.analyser", request);
    }

    @Test
    void testSendTransactionReportToChatbotSuccess() {
        // Arrange
        String report = "Sample report content";

        // Act
        rabbitMQService.sendTransactionReportToChatbot(report);

        // Assert using Google Truth
        verify(rabbitTemplate, times(1)).convertAndSend("financial.report.to.chatbot", report);
        assertThat(report).isEqualTo("Sample report content");
    }

    @Test
    void testSendTransactionReportToChatbotFailure() {
        // Arrange
        String report = "Sample report content";
        doThrow(new RuntimeException("RabbitMQ error")).when(rabbitTemplate).convertAndSend(anyString(), anyString());

        // Act and Assert
        try {
            rabbitMQService.sendTransactionReportToChatbot(report);
        } catch (RuntimeException e) {
            assertThat(e).hasMessageThat().contains("RabbitMQ error");
        }

        // Verify that exception was thrown and logged
        verify(rabbitTemplate, times(1)).convertAndSend("financial.report.to.chatbot", report);
    }
}
