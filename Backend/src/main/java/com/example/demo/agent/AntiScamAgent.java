package com.example.demo.agent;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Description;

@Agent
@Description("Provides anti-scam services by analysing user's given information.")
public class AntiScamAgent extends AbstractAgent<AntiScamAgent.Request, String> {

    protected AntiScamAgent(ChatModel chatModel) {
        super(chatModel);
    }

    public record Request(
            @JsonProperty(required = true) @JsonPropertyDescription(value = "原始的record") String query){
    }

    @Override
    public String apply(Request request) {
        return getClient().
                prompt()
                .user(request.query())
                .call()
                .content();
    }
}
