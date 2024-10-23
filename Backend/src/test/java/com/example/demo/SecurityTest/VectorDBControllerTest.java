package com.example.demo.SecurityTest;

import com.example.demo.controller.ai.VectorDBController;
import com.google.common.truth.Truth;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.*;

public class VectorDBControllerTest {

    private VectorDBController vectorDBController;
    private ChromaVectorStore chromaVectorStoreMock;

    public static void main(String[] args) throws Exception {
        VectorDBControllerTest test = new VectorDBControllerTest();
        test.setup();
        test.testReadForLocal();
//        test.testSaveVectorDB();
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
        String filePath = "D:\\lessons\\2024 s2\\ELEC5619\\5619new\\Backend\\src\\main\\resources\\testFiles\\testvectorDB.txt";
        FileSystemResource mockResource = Mockito.mock(FileSystemResource.class);
        TikaDocumentReader readerMock = Mockito.mock(TikaDocumentReader.class);
        List<Document> mockDocuments = new ArrayList<>();

        // 使用Map构造metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", "1");

        // 根据 bank_statement.txt 文件的内容创建 Document
        Document doc = new Document("testvectorDB", metadata);

        mockDocuments.add(doc);
        Mockito.when(readerMock.read()).thenReturn(mockDocuments);

        // 调用被测方法
        String result = vectorDBController.readForLocal(filePath).trim();

        // 验证结果是否符合预期
        Truth.assertThat(result).isEqualTo("testvectorDB");
        System.out.println("testReadForLocal passed!");
    }

//    public void testSaveVectorDB() throws Exception {
//        // 模拟文件上传
//        MockMultipartFile mockMultipartFile = new MockMultipartFile("file", "test.txt", "text/plain", "这是测试内容".getBytes());
//
//        // 模拟 TikaDocumentReader
//        TikaDocumentReader readerMock = Mockito.mock(TikaDocumentReader.class);
//        List<Document> mockDocuments = new ArrayList<>();
//
//        // 使用Map构造metadata
//        Map<String, Object> metadata = new HashMap<>();
//        metadata.put("id", "1");
//        Document doc = new Document("testvectorDB", metadata);
//        mockDocuments.add(doc);
//
//        // 模拟 readerMock.read()，使用 ArgumentMatchers 来匹配 InputStream
//        Mockito.when(readerMock.read()).thenReturn(mockDocuments);
//
//        // 调用被测方法
//        vectorDBController.saveVectorDB(mockMultipartFile);
//
//        // 验证文档是否被正确添加到 ChromaVectorStore 中
//        ArgumentCaptor<List<Document>> documentCaptor = ArgumentCaptor.forClass(List.class);
//        Mockito.verify(chromaVectorStoreMock).doAdd(documentCaptor.capture());
//
//        // 获取捕获的文档对象
//        List<Document> capturedDocuments = documentCaptor.getValue();
//        Document capturedDocument = capturedDocuments.get(0);
//
//        // 验证 metadata 和 content
//        Truth.assertThat(capturedDocument.getMetadata()).containsExactly("id", "1");
//        Truth.assertThat(capturedDocument.getContent()).isEqualTo("testvectorDB");
//
//        // 验证 fileDocumentIdsMap 中是否正确保存了文档ID
//        Map<String, List<String>> fileDocumentIdsMap = getFileDocumentIdsMapFromController();
//        Truth.assertThat(fileDocumentIdsMap.get("test.txt")).containsExactly(doc.getId());
//
//        System.out.println("testSaveVectorDB passed!");
//    }
//
//    // Helper method to get fileDocumentIdsMap using reflection (if it's private)
//    private Map<String, List<String>> getFileDocumentIdsMapFromController() throws Exception {
//        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
//        fileDocumentIdsMapField.setAccessible(true);
//        return (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);
//    }

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

        // 调用被测方法
        ResponseEntity<String> response = vectorDBController.clearVectorDB();

        // 验证响应是否正确
        Truth.assertThat(response.getStatusCodeValue()).isEqualTo(200);
        Truth.assertThat(response.getBody()).contains("cleared successfully");

        // 验证传递给 chromaVectorStore 的文档 ID 包含重复的 [1, 2, 1, 2]
        Mockito.verify(chromaVectorStoreMock).doDelete(Arrays.asList("1", "2"));

        System.out.println("testClearVectorDB passed!");
    }
}
