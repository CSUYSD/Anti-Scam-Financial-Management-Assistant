package com.example.demo.controller.DocumentController;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/document")
@AllArgsConstructor
public class DocumentController {
    private final VectorStore vectorStore;
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private final OpenAiChatModel openAiChatModel;


    @SneakyThrows
    @PostMapping("/embedding")
    public ResponseEntity<?> embedding(@RequestParam MultipartFile file) {
        try {
            TikaDocumentReader tikaDocumentReader = new TikaDocumentReader(new InputStreamResource(file.getInputStream()));
            List<Document> splitDocuments = new TokenTextSplitter().apply(tikaDocumentReader.read());
            vectorStore.add(splitDocuments);
            return ResponseEntity.ok().body("Document successfully embedded");
        } catch (Exception e) {
            log.error("Error during document embedding: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during document embedding: " + e.getMessage());
        }
    }

    @PostMapping(value = "/chat/stream/database", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStreamWithDatabase(@RequestParam String prompt) {
        // 1. 定义提示词模板，question_answer_context会被替换成向量数据库中查询到的文档。
        String promptWithContext = """
                Below is the context information
                ---------------------
                {question_answer_context}
                ---------------------
                Based on the given context and provided historical information, rather than prior knowledge, respond to the user's query. If the answer is not in the context, inform the user that you cannot answer the question. Response in well-formatted markdown.
                """;
        return ChatClient.create(openAiChatModel).prompt()
                .user(prompt)
                // 2. QuestionAnswerAdvisor会在运行时替换模板中的占位符`question_answer_context`，替换成向量数据库中查询到的文档。此时的query=用户的提问+替换完的提示词模板;
                .advisors(new QuestionAnswerAdvisor(vectorStore, SearchRequest.defaults(), promptWithContext))
                .stream()
                // 3. query发送给大模型得到答案
                .content()
                .map(chatResponse -> ServerSentEvent.builder(chatResponse)
                        .event("message")
                        .build());
    }


}
