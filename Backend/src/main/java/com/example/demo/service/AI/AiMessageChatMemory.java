package com.example.demo.service.AI;

import com.example.demo.Dao.AIDao.AiMessageRepository;
import com.example.demo.model.AI.AiMessage;
import lombok.AllArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AiMessageChatMemory implements ChatMemory {
    private final AiMessageRepository messageRepository;

    /**
     * 不实现，手动前端发起请求保存用户的消息和大模型回复的消息
     */
    @Override
    public void add(String conversationId, List<Message> messages) {
        // This method is intentionally left empty as per the comment in the original code
    }

    /**
     * 查询会话内的消息最新n条历史记录
     *
     * @param conversationId 会话id
     * @param lastN          最近n条
     * @return org.springframework.ai.chat.messages.Message格式的消息
     */
    @Override
    public List<Message> get(String conversationId, int lastN) {
        return messageRepository
                .findBySessionId(Long.parseLong(conversationId), lastN)
                .stream()
                .map(this::toSpringAiMessage)
                .collect(Collectors.toList());
    }

    /**
     * 清除会话内的消息
     *
     * @param conversationId 会话id
     */
    @Override
    public void clear(String conversationId) {
        messageRepository.deleteBySessionId(Long.parseLong(conversationId));
    }

    private Message toSpringAiMessage(AiMessage aiMessage) {
        switch (aiMessage.getType()) {
            case USER:
                return new UserMessage(aiMessage.getTextContent());
            case ASSISTANT:
                return new AssistantMessage(aiMessage.getTextContent());
            case SYSTEM:
                return new SystemMessage(aiMessage.getTextContent());
            default:
                throw new IllegalArgumentException("Unknown message type: " + aiMessage.getType());
        }
    }
}
