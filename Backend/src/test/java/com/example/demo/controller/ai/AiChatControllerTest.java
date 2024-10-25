package com.example.demo.controller.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(MockitoJUnitRunner.class)
public class AiChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @InjectMocks
    private AiChatController aiChatController;

    @Mock
    private ChromaVectorStore chromaVectorStore; // Mock ChromaVectorStore
    @Mock
    private OpenAiChatModel openAiChatModel; // Mock OpenAiChatModel
    @Mock
    private ChatMemory chatMemory; // Mock ChatMemory

    private final String jwtToken = "Bearer your_jwt_token_here";

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testChatStreamWithVectorDB() throws Exception {
        String prompt = "你好";
        String conversationId = "12345";

        // 这里可以模拟 ChatClient 的行为
        // 例如，假设 ChatClient.create(openAiChatModel).prompt().user(prompt).call().content() 返回 expectedResponse

        mockMvc.perform(get("/ai/chat/rag")
                        .param("prompt", prompt)
                        .param("conversationId", conversationId)
                        .header("Authorization", jwtToken)  // 添加 JWT token 到请求头
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk())
                .andReturn(); // 获取返回结果
    }

    @Test
    public void testChatStream() throws Exception {
        String prompt = "你好";
        String sessionId = "session123";

        // 这里可以模拟 ChatClient 的行为
        // 例如，假设 ChatClient.create(openAiChatModel).prompt().user(prompt).call().content() 返回 expectedResponse

        mockMvc.perform(get("/ai/chat/general")
                        .param("prompt", prompt)
                        .param("sessionId", sessionId)
                        .header("Authorization", jwtToken)  // 添加 JWT token 到请求头
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk())
                .andReturn(); // 获取返回结果
    }
}