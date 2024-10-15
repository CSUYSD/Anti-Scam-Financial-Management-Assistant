package com.example.demo.service.ai;

import com.example.demo.utility.jwt.JwtUtil;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiAnalyserService {
    public final OpenAiChatModel openAiChatModel;
    public final JwtUtil jwtUtil;
    public final GetCurrentUserInfo getCurrentUserInfo;

    @Autowired
    public AiAnalyserService(OpenAiChatModel openAiChatModel, JwtUtil jwtUtil, GetCurrentUserInfo getCurrentUserInfo) {
        this.openAiChatModel = openAiChatModel;
        this.jwtUtil = jwtUtil;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }


    public String analyseCurrentRecord(String currentRecord, String recentRecords) {
        String context = """
        Based on the following recent transaction records, generate a reply using the context provided:
        ---------------------
        {context}
        ---------------------
        If you find any transaction suspicious of being a scam, start your reply with 'WARNING'. Keep your response under 50 words.
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
}
