package com.example.demo.controller.AiFunctionController;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
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
    private final OpenAiEmbeddingModel openAiEmbeddingModel;
    @Autowired VectorStore vectorStore;
    private final OpenAiChatModel openAiChatModel;
    private final ChatMemory chatMemory = new InMemoryChatMemory();

    @SneakyThrows
    @PostMapping("etl/test/multipart")
    public String readForMultiPart(@RequestParam MultipartFile file) {
        Resource resource = new InputStreamResource(file.getInputStream());
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        return reader
                .read()
                .get(0)
                .getContent();
    }

    @SneakyThrows
    @PostMapping("etl/read/local")
    public String readForLocal(@RequestParam String path) {
        Resource resource = new FileSystemResource(path);
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        return reader
                .read()
                .get(0)
                .getContent();
    }

    @SneakyThrows
    @PostMapping("etl/read/multipart")
    public void saveVectorDB(@RequestParam MultipartFile file) {
        Resource resource = new InputStreamResource(file.getInputStream());
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> splitDocuments = new TokenTextSplitter().apply(reader.read());
        vectorStore.add(splitDocuments);
    }

    @SneakyThrows
    @PostMapping(value = "chat/stream/database", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStreamWithDatabase(@RequestParam String prompt, @RequestParam String sessionId) {
        // 1. 定义提示词模板，question_answer_context会被替换成向量数据库中查询到的文档。
        String promptWithContext = """
                Below is the context information:
                ---------------------
                {question_answer_context}
                ---------------------
                Please respond based on the provided context and historical information, rather than using prior knowledge. If the answer is not present in the context, let the user know that you don't know the answer.
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

    @GetMapping("etl/clear")
    public ResponseEntity<String> clearVectorDB(@RequestBody List<String> vectorIds) {
        try {
             vectorStore.delete(vectorIds);
            return ResponseEntity.ok("Vector database cleared successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to clear vector database.");
        }
    }

    @PostMapping("embedding")
    public float[] embedding(@RequestParam String text) {
        return openAiEmbeddingModel.embed(text);
    }
}
