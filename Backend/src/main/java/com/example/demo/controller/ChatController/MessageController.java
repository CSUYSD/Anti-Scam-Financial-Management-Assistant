package com.example.demo.controller.ChatController;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.apache.catalina.User;
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
    // 模拟数据库存储会话和消息
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

    @PostMapping("/chat/stream")
    public Flux<ServerSentEvent<String>> chatStream(@RequestParam String prompt) {
        return ChatClient.create(openAiChatModel).prompt()
                .messages(new SystemMessage("you are a finance management helper"), new UserMessage(prompt))
                .stream() //流式返回
                .chatResponse().map(chatResponse -> ServerSentEvent.builder(toJsonString(chatResponse))
                        .event("message")
                        .build());
    }

    @PostMapping(value = "chat/stream/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStreamWithHistory(@RequestParam String prompt,
                                                               @RequestParam String sessionId) {
        // 1. 如果需要存储会话和消息到数据库，自己可以实现ChatMemory接口，
        //    这里使用InMemoryChatMemory，内存存储。
        // 2. 传入会话id，MessageChatMemoryAdvisor会根据会话id去查找消息。
        // 3. 只需要携带最近10条消息
        var messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                // MessageChatMemoryAdvisor会在消息发送给大模型之前，从ChatMemory中获取会话的历史消息，
                // 然后一起发送给大模型。
                .advisors(messageChatMemoryAdvisor)
                .stream()
                .content()
                .map(chatResponse -> ServerSentEvent.builder(chatResponse)
                        .event("message")
                        .build());
    }

    @SneakyThrows
    private String toJsonString(ChatResponse chatResponse) {
        return objectMapper.writeValueAsString(chatResponse);
    }
}
