package com.example.demo.model.AI;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 历史消息
 */
@Entity
@Data
public class AiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 消息类型(用户/助手/系统)
     */
    @Enumerated(EnumType.STRING)
    private MessageType type;

    /**
     * 消息内容
     */
    @Column(columnDefinition = "TEXT")
    private String textContent;

    @ElementCollection
    @CollectionTable(name = "ai_message_media", joinColumns = @JoinColumn(name = "ai_message_id"))
    private List<Media> medias;

    /**
     * 会话
     */
    @ManyToOne
    @JoinColumn(name = "ai_session_id")
    private AiSession session;

    private LocalDateTime createdTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
    }

    @Data
    @AllArgsConstructor
    @Embeddable
    public static class Media {
        private String type;
        private String data;

        public Media() {

        }
    }

    public enum MessageType {
        USER, ASSISTANT, SYSTEM
    }
}

