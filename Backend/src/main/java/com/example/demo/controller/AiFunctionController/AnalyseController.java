package com.example.demo.controller.AiFunctionController;

import com.example.demo.model.TransactionRecord;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analyse")
public class AnalyseController {
    public final OpenAiChatModel openAiChatModel;

    @Autowired
    public AnalyseController(OpenAiChatModel openAiChatModel) {
        this.openAiChatModel = openAiChatModel;
    }

    public String analyseCurrentRecord(TransactionRecord transactionRecord) {
        String promptWithContext = """
                Below is the context information:
                ---------------------
                {question_answer_context}
                ---------------------
                You MUST respond based on the provided context information. The context information is a The If you think this transaction record is .
                """;
        Message recordContent = new UserMessage(transactionRecord.getRecord());
        Prompt prompt = new Prompt()
        return ChatClient
                .create(openAiChatModel)
                .prompt(promptWithContext)
                .




    }
}
