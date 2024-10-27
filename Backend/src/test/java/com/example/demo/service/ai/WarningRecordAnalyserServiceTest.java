package com.example.demo.service.ai;

import com.example.demo.model.FinancialReport;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.repository.FinancialReportRepository;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.PromptManager;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.jwt.JwtUtil;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.ChromaVectorStore;

import java.util.ArrayList;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WarningRecordAnalyserServiceTest {

    @Mock private OpenAiChatModel openAiChatModel;
    @Mock private JwtUtil jwtUtil;
    @Mock private GetCurrentUserInfo getCurrentUserInfo;
    @Mock private TransactionRecordService recordService;
    @Mock private ChromaVectorStore vectorStore;
    @Mock private PromptManager promptManager;
    @Mock private RabbitMQService rabbitMQService;
    @Mock private FinancialReportRepository financialReportRepository;

    private AiAnalyserService aiAnalyserService;

    @Before
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        aiAnalyserService = new AiAnalyserService(
                openAiChatModel, jwtUtil, getCurrentUserInfo, recordService,
                vectorStore, promptManager, rabbitMQService, financialReportRepository
        );
    }

    @Test
    public void analyseCurrentRecord_withValidInput_shouldReturnAnalysis() {
        // Arrange
        String currentRecord = "Transfer $100 to John";
        String recentRecords = "Previous transfer $50 to Mary";
        String expectedResponse = "Analysis result";

        doAnswer(invocation -> expectedResponse)
                .when(openAiChatModel).call(any(Prompt.class));

        // Act
        String result = aiAnalyserService.analyseCurrentRecord(currentRecord, recentRecords);

        // Assert
        assertThat(result).isEqualTo(expectedResponse);
        verify(openAiChatModel).call(any(Prompt.class));
    }

    @Test
    public void generateOverAllFinancialReport_shouldGenerateReport() {
        // Arrange
        String token = "test-token";
        Long userId = 1L;
        Long accountId = 2L;
        TransactionUser mockUser = new TransactionUser();
        List<TransactionRecordDTO> mockRecords = new ArrayList<>();
        String expectedResponse = "Financial analysis report";

        doAnswer(invocation -> userId)
                .when(getCurrentUserInfo).getCurrentUserId(token);
        doAnswer(invocation -> accountId)
                .when(getCurrentUserInfo).getCurrentAccountId(userId);
        doAnswer(invocation -> mockUser)
                .when(getCurrentUserInfo).getCurrentUserEntity(token);
        doAnswer(invocation -> mockRecords)
                .when(recordService).getCertainDaysRecords(accountId, 10);
        doAnswer(invocation -> "Report prompt")
                .when(promptManager).getFinancialReportPrompt(any());
        doAnswer(invocation -> "Report context")
                .when(promptManager).getRAGPromptTemplate();

        doAnswer(invocation -> expectedResponse)
                .when(openAiChatModel).call(any(Prompt.class));

        // Act
        String result = aiAnalyserService.generateOverAllFinancialReport(token);

        // Assert
        assertThat(result).isEqualTo(expectedResponse);
        verify(rabbitMQService, timeout(1000)).sendTransactionReportToChatbot(expectedResponse);
        verify(financialReportRepository, timeout(1000)).save(any(FinancialReport.class));
    }

    @Test
    public void generateOverAllFinancialReport_withError_shouldThrowException() {
        // Arrange
        String token = "test-token";
        doAnswer(invocation -> { throw new RuntimeException("User not found"); })
                .when(getCurrentUserInfo).getCurrentUserId(token);

        // Act & Assert
        try {
            aiAnalyserService.generateOverAllFinancialReport(token);
            assertThat(false).isTrue(); // Should not reach here
        } catch (Throwable thrown) {
            assertThat(thrown).isInstanceOf(RuntimeException.class);
            assertThat(thrown).hasMessageThat().contains("User not found");
        }
    }
}