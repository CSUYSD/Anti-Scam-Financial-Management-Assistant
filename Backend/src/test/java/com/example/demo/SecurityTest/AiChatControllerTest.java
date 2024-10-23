package com.example.demo.SecurityTest;

import com.example.demo.controller.ai.AiChatController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
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

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testChatStreamWithVectorDB() throws Exception {
        String prompt = "你好";
        String conversationId = "12345";
        String expectedResponse = "这是一个测试响应"; // 模拟的响应

        // 这里可以模拟 ChatClient 的行为
        // 例如，假设 ChatClient.create(openAiChatModel).prompt().user(prompt).call().content() 返回 expectedResponse

        mockMvc.perform(get("/ai/chat/rag")
                        .param("prompt", prompt)
                        .param("conversationId", conversationId)
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk())
                .andExpect(content().string(expectedResponse));
    }

    @Test
    public void testChatStream() throws Exception {
        String prompt = "你好";
        String sessionId = "session123";
        String expectedResponse = "这是另一个测试响应"; // 模拟的响应

        // 这里可以模拟 ChatClient 的行为
        // 例如，假设 ChatClient.create(openAiChatModel).prompt().user(prompt).call().content() 返回 expectedResponse

        mockMvc.perform(get("/ai/chat/general")
                        .param("prompt", prompt)
                        .param("sessionId", sessionId)
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk())
                .andExpect(content().string(expectedResponse));
    }
}