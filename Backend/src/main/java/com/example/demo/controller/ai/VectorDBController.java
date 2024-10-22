package com.example.demo.controller.ai;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.SneakyThrows;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("vector-db")
public class VectorDBController {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final Map<String, List<String>> fileDocumentIdsMap = new HashMap<>();
    private final ChromaVectorStore chromaVectorStore;

    @Autowired
    public VectorDBController(ChromaVectorStore chromaVectorStore) {
        this.chromaVectorStore = chromaVectorStore;
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
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        Resource resource = new InputStreamResource(file.getInputStream());
        TikaDocumentReader reader = new TikaDocumentReader(resource);
        List<Document> splitDocuments = new TokenTextSplitter().apply(reader.read());

        String fileName = file.getOriginalFilename();
        List<String> documentIds = new ArrayList<>();

        for (Document doc : splitDocuments) {
            documentIds.add(doc.getId());
            System.out.printf("Document id: %s\n", doc.getId());
        }
        // 保存文件名和对应的文档ID列表
        fileDocumentIdsMap.put(fileName, documentIds);

        chromaVectorStore.doAdd(splitDocuments);
    }

    //根据文件名进行单个文件的删除
    @DeleteMapping("etl/delete/{fileName}")
    public ResponseEntity<String> deleteFileFromVectorDB(@PathVariable String fileName) {
        List<String> documentIds = fileDocumentIdsMap.get(fileName);
        if (documentIds == null || documentIds.isEmpty()) {
            return ResponseEntity.badRequest().body("File not found or already deleted.");
        }

        try {
            System.out.printf("Deleting %d documents for file '%s' from vector database...\n", documentIds.size(), fileName);
            chromaVectorStore.doDelete(documentIds);
            fileDocumentIdsMap.remove(fileName);
            return ResponseEntity.ok("File '" + fileName + "' deleted successfully from vector database.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete file '" + fileName + "' from vector database.");
        }
    }

    @GetMapping("etl/clear")
    public ResponseEntity<String> clearVectorDB() {
        try {
            List<String> allDocumentIds = fileDocumentIdsMap.values().stream()
                    .flatMap(List::stream)
                    .collect(Collectors.toList());

            System.out.printf("Deleting %d documents from vector database...\n", allDocumentIds.size());
            chromaVectorStore.doDelete(allDocumentIds);
            fileDocumentIdsMap.clear();
            return ResponseEntity.ok("Vector database cleared successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to clear vector database.");
        }
    }

    @SneakyThrows
    private String toJsonString(ChatResponse chatResponse) {
        return objectMapper.writeValueAsString(chatResponse);
    }
}