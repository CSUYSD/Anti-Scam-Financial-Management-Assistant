package com.example.demo.controller.DocumentController;

import lombok.AllArgsConstructor;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/document")
@AllArgsConstructor
public class DocumentController {
    private final VectorStore vectorStore;
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);


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


}
