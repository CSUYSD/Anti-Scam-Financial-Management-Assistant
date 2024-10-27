package com.example.demo.controller.ai;

import com.example.demo.agent.Agent;
import com.example.demo.model.ai.AiMessageWrapper;
import com.example.demo.utility.GetCurrentUserInfo;
import com.example.demo.utility.PromptManager;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai/chat")
@Slf4j
public class AiChatController {
    @Autowired
    VectorStore vectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();
    private final ApplicationContext applicationContext;
    private final GetCurrentUserInfo getCurrentUserInfo;


    private String currentConversationId = "";
    @Autowired
    private PromptManager promptManager;

    public AiChatController(OpenAiChatModel openAiChatModel, ApplicationContext applicationContext, GetCurrentUserInfo getCurrentUserInfo) {
        this.openAiChatModel = openAiChatModel;
        this.applicationContext = applicationContext;
        this.getCurrentUserInfo = getCurrentUserInfo;
    }


    @SneakyThrows
    @PostMapping(value = "/rag")
    public String chat(@RequestBody AiMessageWrapper input, @RequestHeader("Authorization") String token) {
        String[] functionBeanNames = new String[0];
        // 如果启用Agent则获取Agent的bean
        if (input.getParams().getEnableAgent()) {
            // 获取带有Agent注解的bean
            Map<String, Object> beansWithAnnotation = applicationContext.getBeansWithAnnotation(Agent.class);
            functionBeanNames = new String[beansWithAnnotation.keySet().size()];
            functionBeanNames = beansWithAnnotation.keySet().toArray(functionBeanNames);
            System.out.printf("================functionBeanNames: %s\n", functionBeanNames);
            input.getInputMessage().setAccountId(String.valueOf(getCurrentUserInfo.getCurrentAccountId(getCurrentUserInfo.getCurrentUserId(token))));
        }

        return ChatClient.create(openAiChatModel).prompt()
                .user(promptUserSpec -> buildPrompt(promptUserSpec, input))
                .functions(functionBeanNames)
                .advisors(advisorSpec -> {
                    // use chat memory
                    useChatHistory(advisorSpec, input.getInputMessage().getConversationId());
                    // use vectore store
                    useVectorStore(advisorSpec, input.getParams().getEnableVectorStore());
                })
                .call()
                .content();
    }

    private void buildPrompt(ChatClient.PromptUserSpec promptUserSpec, AiMessageWrapper message) {
        if (message.getParams().getEnableAgent()){
            String m = message.getInputMessage().getMessage() + "My account id is " + message.getInputMessage().getAccountId();
            promptUserSpec.text(m);
        } else {
            promptUserSpec.text(message.getInputMessage().getMessage());
        }
    }


    @GetMapping(value = "/general", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public String chatStream(@RequestParam String prompt, @RequestParam String sessionId) {
        MessageChatMemoryAdvisor messageChatMemoryAdvisor = new MessageChatMemoryAdvisor(chatMemory, sessionId, 10);
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                .advisors(messageChatMemoryAdvisor)
                .call()
                .content();
    }

    //normal chat
    @GetMapping("/chatWithoutMemory")
    public String chat(@RequestParam String prompt) {
        ChatClient chatClient = ChatClient.create(openAiChatModel);
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

    public void useChatHistory(ChatClient.AdvisorSpec advisorSpec, String sessionId) {
        advisorSpec.advisors(new MessageChatMemoryAdvisor(chatMemory, sessionId, 10));
    }

    public void useVectorStore(ChatClient.AdvisorSpec advisorSpec, Boolean enableVectorStore) {
        if (!enableVectorStore) return;
        String context = promptManager.getRAGPromptTemplate();
        advisorSpec.advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), context));
    }

    @RabbitListener(queues = "financial.report.to.chatbot")
    public void receiveFinancialReport(String report) {
        log.info("Chat bot received financial report from AI analyser");
        chatMemory.add(currentConversationId, new SystemMessage(report));
    }
}
