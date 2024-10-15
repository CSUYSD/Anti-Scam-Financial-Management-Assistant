package com.example.demo.agent;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Description;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

@Slf4j
public abstract class AbstractAgent<Request, Response> implements Function<Request, Response> {
    private final ChatClient client;

    public AbstractAgent(ChatModel model) {
        this.client = ChatClient
                .builder(model)
                .defaultFunctions()
                .build();
    }

    public ChatClient getClient() {
        return client;
    }

    public String[] getFunctions() {
        List<Class<?>> classList = Arrays.stream(this.getClass().getClasses()).filter(aClass -> aClass.isAnnotationPresent(Description.class)).toList();
        String[] names = new String[classList.size()];
        classList.stream().map(aClass -> StringUtils.uncapitalize(this.getClass().getSimpleName()) + "." + aClass.getSimpleName()).toList().toArray(names);
        return names;
    }


}
