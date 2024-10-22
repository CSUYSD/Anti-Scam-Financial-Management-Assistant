package com.example.demo.service.ai;

import com.example.demo.model.FinancialReport;
import com.example.demo.model.TransactionUser;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.repository.FinancialReportRepository;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.service.rabbitmq.RabbitMQService;
import com.example.demo.utility.PromptManager;
import com.example.demo.utility.converter.PromptConverter;
import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class AiAnalyserService {
    public final OpenAiChatModel openAiChatModel;
    public final JwtUtil jwtUtil;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final TransactionRecordService recordService;
    public final ChromaVectorStore vectorStore;
    public final PromptManager promptManager;
    public final RabbitMQService rabbitMQService;
    public final FinancialReportRepository financialReportRepository;

    @Autowired
    public AiAnalyserService(OpenAiChatModel openAiChatModel, JwtUtil jwtUtil, GetCurrentUserInfo getCurrentUserInfo, TransactionRecordService recordService, ChromaVectorStore vectorStore, PromptManager promptManager, RabbitMQService rabbitMQService, FinancialReportRepository financialReportRepository) {
        this.openAiChatModel = openAiChatModel;
        this.jwtUtil = jwtUtil;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.recordService = recordService;
        this.vectorStore = vectorStore;
        this.promptManager = promptManager;
        this.rabbitMQService = rabbitMQService;
        this.financialReportRepository = financialReportRepository;
    }


    public String analyseCurrentRecord(String currentRecord, String recentRecords) {
        String context = """
        Based on the following recent transaction records, generate a reply using the context provided.:
        ---------------------
        {context}
        ---------------------
        If no recent records are given, reply nothing. If you find any transaction suspicious of being a scam, start your reply with 'WARNING'. Keep your response under 50 words.
        """;
        try {
            Message userMessage = new UserMessage(currentRecord);

            SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(context);

            Message systemMessage = systemPromptTemplate.createMessage(Map.of("context", recentRecords) );

            Prompt prompt = new Prompt(List.of(userMessage, systemMessage));
            List<Generation> generations = openAiChatModel.call(prompt).getResults();
            return generations.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String generateOverAllFinancialReport(String token) {
        Long userId = getCurrentUserInfo.getCurrentUserId(token);
        Long accountId = getCurrentUserInfo.getCurrentAccountId(userId);
        List<TransactionRecordDTO> records = recordService.getCertainDaysRecords(accountId, 10);
        String recentRecords = PromptConverter.parseRecentTransactionRecordsToPrompt(records);

        String context = promptManager.getFinancialReportPrompt(recentRecords);
        String prompt = String.format(promptManager.getFinancialReportContext(), recentRecords);

        ChatClient chatClient = ChatClient.create(openAiChatModel);
        String response = chatClient.prompt()
                .user(prompt)
                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), context))
                .call()
                .content();

        // Async sending message to chatbot
        CompletableFuture.runAsync(() -> {
            try {
                rabbitMQService.sendTransactionReportToChatbot(response);
            } catch (Exception e) {
                log.error("Error sending financial report to chatbot: ", e);
            }
        });

        // Async saving report to database
        CompletableFuture.runAsync(() -> {
            try {
                TransactionUser user = getCurrentUserInfo.getCurrentUserEntity(token);
                financialReportRepository.save(new FinancialReport(response, user));
            } catch (Exception e) {
                log.error("Error sending financial report to chatbot: ", e);
            }
        });
        return response;
    }
}
