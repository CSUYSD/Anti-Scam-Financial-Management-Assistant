package com.example.demo.agent;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Slf4j
public abstract class AbstractAgent<Req, Resp> implements Function<Req, Resp> {
    private final ChatClient client;
    private final Map<String, String> functionNameMapping;

    protected AbstractAgent(ChatModel chatModel) {
        // 1. 首先初始化映射表
        this.functionNameMapping = new HashMap<>();
        this.client = ChatClient
                .builder(chatModel)
                .defaultFunctions(getFunctions())
                .build();
    }

    public ChatClient getChatClient() {
        return client;
    }

    /**
     * 获取内嵌的Function Call也就是Agent的Tools
     *
     * @return Function Call名称列表
     */
    private String[] getFunctions() {
        //  找到所有带有Description注解的内部类
        List<Class<?>> classList = Arrays.stream(this.getClass().getClasses())
                .filter(aClass -> aClass.isAnnotationPresent(Description.class))
                .toList();

        //  创建结果数组
        String[] names = new String[classList.size()];

        //  转换类为函数名称并存储映射
        return classList.stream()
                .map(aClass -> {
                    // 生成Spring Bean名称
                    String beanName = StringUtils.uncapitalize(this.getClass().getSimpleName())
                            + "." + aClass.getSimpleName();

                    // 生成OpenAI函数名
                    String functionName = StringUtils.uncapitalize(aClass.getSimpleName())
                            .replaceAll("([a-z])([A-Z])", "$1_$2")
                            .toLowerCase();

                    // 存储映射关系
                    functionNameMapping.put(functionName, beanName);

                    // 返回OpenAI函数名
                    return functionName;
                })
                .toArray(String[]::new);
    }

    private String processFunctionClass(Class<?> functionClass) {
        String beanName = this.getClass().getSimpleName() + "." + functionClass.getSimpleName();

        String openAiFunctionName = generateOpenAiFunctionName(functionClass);

        functionNameMapping.put(openAiFunctionName, beanName);

        return openAiFunctionName;
    }

    private String generateOpenAiFunctionName(Class<?> functionClass) {
        String baseName = StringUtils.uncapitalize(functionClass.getSimpleName());
        return baseName.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    protected String getBeanNameForFunction(String openAiFunctionName) {
        return functionNameMapping.get(openAiFunctionName);
    }
}