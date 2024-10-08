package com.example.demo.controller.AiFunctionController;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.SneakyThrows;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/message")
public class MessageController {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @Autowired
    public MessageController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }

    @PostMapping("/chat")
    public String chat(@RequestParam String prompt) {
        ChatClient chatClient = ChatClient.create(openAiChatModel);
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    @PostMapping(value = "/chat/stream/test", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStreamTest(@RequestParam String prompt, @RequestParam String sessionId) {
        MessageChatMemoryAdvisor messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                .advisors(messageChatMemoryAdvisor)
                .stream()
                .content();
    }


    //streaming chat with memory use SSE pipeline.
    @PostMapping(value = "/chat/stream/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStream(@RequestParam String prompt, @RequestParam String sessionId) {
        MessageChatMemoryAdvisor messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .messages(new SystemMessage("you are a finance management helper"), new UserMessage(prompt))
                .advisors(messageChatMemoryAdvisor)
                .stream() //流式返回
                .content().map(chatResponse -> ServerSentEvent.builder(chatResponse)
                        .event("message")
                        .build());
    }


    @SneakyThrows
    private String toJsonString(ChatResponse chatResponse) {
        return objectMapper.writeValueAsString(chatResponse);
    }
}