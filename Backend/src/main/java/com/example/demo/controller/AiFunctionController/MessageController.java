package com.example.demo.controller.AiFunctionController;


import com.example.demo.Dao.AIDao.AiMessageRepository;
import com.example.demo.service.AI.AiMessageChatMemory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.SneakyThrows;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.model.Media;
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

    private AiMessageRepository messageRepository;
    private AiMessageChatMemory aiMessageChatMemory;

    @Autowired
    public MessageController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }

    @PostMapping("/chat")
    public String chat(@RequestParam String prompt) {
        ChatClient chatClient = ChatClient.create(openAiChatModel);
        return chatClient.prompt()
                .user(promptUserSpec -> {
                    // AiMessageInput转成Message
                    Message message = AiMessageChatMemory.toSpringAiMessage(input.toEntity());
                    if (message instanceof UserMessage userMessage &&
                            !CollectionUtils.isEmpty(userMessage.getMedia())) {
                        // 用户发送的图片/语言
                        Media[] medias = new Media[userMessage.getMedia().size()];
                        promptUserSpec.media(userMessage.getMedia().toArray(medias));
                    }
                    // 用户发送的文本
                    promptUserSpec.text(message.getContent());
                })
                // MessageChatMemoryAdvisor会在消息发送给大模型之前，从ChatMemory中获取会话的历史消息，然后一起发送给大模型。
                .advisors(messageChatMemoryAdvisor)
                .stream()
                .content()
                .map(chatResponse -> ServerSentEvent.builder(toJsonString(chatResponse))
                        // 和前端监听的事件相对应
                        .event("message")
                        .build());
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