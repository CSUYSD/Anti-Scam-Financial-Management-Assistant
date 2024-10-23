package com.example.demo.SecurityTest;

import com.example.demo.controller.ai.VectorDBController;
import com.google.common.truth.Truth;
import org.mockito.Mockito;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class VectorDBControllerTest {

    private VectorDBController vectorDBController;
    private ChromaVectorStore chromaVectorStoreMock;

    public static void main(String[] args) throws Exception {
        VectorDBControllerTest test = new VectorDBControllerTest();
        test.setup();
        test.testReadForLocal();
        test.testSaveVectorDB();
        test.testDeleteFileFromVectorDB();
        test.testClearVectorDB();
    }

    public void setup() throws Exception {
        chromaVectorStoreMock = Mockito.mock(ChromaVectorStore.class);
        vectorDBController = new VectorDBController(chromaVectorStoreMock);

        // 使用反射来设置 fileDocumentIdsMap
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);

        // 设置一个初始值
        Map<String, List<String>> mockFileDocumentIdsMap = new HashMap<>();
        fileDocumentIdsMapField.set(vectorDBController, mockFileDocumentIdsMap);
    }

    public void testReadForLocal() throws Exception {
        String filePath = "D:\\lessons\\2024 s2\\ELEC5619\\5619new\\Backend\\src\\main\\resources\\testFiles\\bank_statement.txt";
        FileSystemResource mockResource = Mockito.mock(FileSystemResource.class);
        TikaDocumentReader readerMock = Mockito.mock(TikaDocumentReader.class);
        List<Document> mockDocuments = new ArrayList<>();

        // 使用Map构造metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", "1");

        // 根据 bank_statement.txt 文件的内容创建 Document
        Document doc = new Document("2024-09-01 Grocery Store 66.948894 4933.051106", metadata);

        mockDocuments.add(doc);
        Mockito.when(readerMock.read()).thenReturn(mockDocuments);

        // 调用被测方法
        String result = vectorDBController.readForLocal(filePath);

        // 验证结果是否符合预期
        Truth.assertThat(result).isEqualTo("2024-09-01 Grocery Store 66.948894 4933.051106");
        System.out.println("testReadForLocal passed!");
    }

    public void testSaveVectorDB() throws Exception {
        MockMultipartFile mockMultipartFile = new MockMultipartFile("file", "test.txt", "text/plain", "Test content".getBytes());
        InputStreamResource mockResource = new InputStreamResource(new ByteArrayInputStream(mockMultipartFile.getBytes()));
        TikaDocumentReader readerMock = Mockito.mock(TikaDocumentReader.class);
        List<Document> mockDocuments = new ArrayList<>();

        // 使用Map构造metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", "1");
        Document doc = new Document("Test content", metadata);

        mockDocuments.add(doc);
        Mockito.when(readerMock.read()).thenReturn(mockDocuments);

        // 调用被测方法
        vectorDBController.saveVectorDB(mockMultipartFile);

        // 验证文档是否被正确添加到 ChromaVectorStore 中
        Mockito.verify(chromaVectorStoreMock, Mockito.times(1)).doAdd(mockDocuments);

        System.out.println("testSaveVectorDB passed!");
    }

    public void testDeleteFileFromVectorDB() throws Exception {
        String fileName = "test.txt";
        List<String> documentIds = new ArrayList<>();
        documentIds.add("1");

        // 使用反射将模拟数据插入 fileDocumentIdsMap
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> mockFileDocumentIdsMap = (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);
        mockFileDocumentIdsMap.put(fileName, documentIds);

        ResponseEntity<String> response = vectorDBController.deleteFileFromVectorDB(fileName);

        // Assert response is ok
        Truth.assertThat(response.getStatusCodeValue()).isEqualTo(200);
        Truth.assertThat(response.getBody()).contains("deleted successfully");

        // Verify that the documents are deleted from chromaVectorStore
        Mockito.verify(chromaVectorStoreMock, Mockito.times(1)).doDelete(documentIds);

        System.out.println("testDeleteFileFromVectorDB passed!");
    }

    public void testClearVectorDB() throws Exception {
        List<String> documentIds = new ArrayList<>();
        documentIds.add("1");
        documentIds.add("2");

        // 使用反射将模拟数据插入 fileDocumentIdsMap
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> mockFileDocumentIdsMap = (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);
        mockFileDocumentIdsMap.put("test1.txt", documentIds);
        mockFileDocumentIdsMap.put("test2.txt", documentIds);

        ResponseEntity<String> response = vectorDBController.clearVectorDB();

        // Assert response is ok
        Truth.assertThat(response.getStatusCodeValue()).isEqualTo(200);
        Truth.assertThat(response.getBody()).contains("cleared successfully");

        // Verify that the documents are deleted from chromaVectorStore
        Mockito.verify(chromaVectorStoreMock, Mockito.times(1)).doDelete(documentIds);

        System.out.println("testClearVectorDB passed!");
    }
}
