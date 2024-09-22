package com.example.demo.controller.ChatController;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.catalina.User;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/message")
public class MessageController {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final OpenAiChatModel openAiChatModel;

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

    @PostMapping("/chat/stream")
    public Flux<ServerSentEvent<String>> chatStream(@RequestParam String prompt) {
        return ChatClient.create(openAiChatModel).prompt()
                .messages(new SystemMessage("you are a finance management helper"), new UserMessage(prompt))
                .stream() //流式返回
                .chatResponse().map(chatResponse -> ServerSentEvent.builder(toJsonString(chatResponse))
                        .event("message")
                        .build());
    }

    @SneakyThrows
    private String toJsonString(ChatResponse chatResponse) {
        return objectMapper.writeValueAsString(chatResponse);
    }
}
