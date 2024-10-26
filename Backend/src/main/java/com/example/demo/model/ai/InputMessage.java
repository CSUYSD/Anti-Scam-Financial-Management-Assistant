package com.example.demo.model.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InputMessage {
    String conversationId;
    String message;
    String accountId;
    public InputMessage(String message, String conversationId, String accountId) {
        this.message = message;
        this.conversationId = conversationId;
        this.accountId = accountId;
    }
}