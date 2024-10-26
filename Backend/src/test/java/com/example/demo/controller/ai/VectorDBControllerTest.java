package com.example.demo.controller.ai;

import static com.google.common.truth.Truth.assertThat;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.*;

import com.example.demo.service.aws.S3Service;
import com.example.demo.utility.GetCurrentUserInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.ChromaVectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.*;

public class VectorDBControllerTest {

    private VectorDBController vectorDBController;

    @Mock
    private ChromaVectorStore chromaVectorStore;

    @Mock
    private S3Service s3Service;

    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;

    @Mock
    private TokenTextSplitter tokenTextSplitter;

    @BeforeEach
    public void setup() throws Exception {
        MockitoAnnotations.openMocks(this);
        vectorDBController = new VectorDBController(chromaVectorStore, s3Service, getCurrentUserInfo);

        // 初始化 fileDocumentIdsMap
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> mockFileDocumentIdsMap = new HashMap<>();
        fileDocumentIdsMapField.set(vectorDBController, mockFileDocumentIdsMap);
    }

    @Test
    public void testReadForLocal() throws Exception {
        // Arrange
        String filePath = "D:\\lessons\\2024 s2\\ELEC5619\\5619new\\Backend\\src\\main\\resources\\testFiles\\testvectorDB.txt";
        FileSystemResource mockResource = mock(FileSystemResource.class);
        TikaDocumentReader readerMock = mock(TikaDocumentReader.class);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", "1");
        Document doc = new Document("testvectorDB", metadata);
        List<Document> mockDocuments = Collections.singletonList(doc);

        when(readerMock.read()).thenReturn(mockDocuments);

        // Act
        String result = vectorDBController.readForLocal(filePath).trim();

        // Assert
        assertThat(result).isEqualTo("testvectorDB");
    }

    @Test
    public void testDeleteFileFromVectorDB() throws Exception {
        // Arrange
        String fileName = "test.txt";
        List<String> documentIds = Collections.singletonList("1");

        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> mockFileDocumentIdsMap = (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);
        mockFileDocumentIdsMap.put(fileName, documentIds);

        // Act
        ResponseEntity<String> response = vectorDBController.deleteFileFromVectorDB(fileName);

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).contains("deleted successfully");
        verify(chromaVectorStore, times(1)).doDelete(documentIds);
    }

    @Test
    public void testClearVectorDB() throws Exception {
        // Arrange
        List<String> documentIds = Arrays.asList("1", "2");
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> mockFileDocumentIdsMap = (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);
        mockFileDocumentIdsMap.put("test1.txt", documentIds);

        // Act
        ResponseEntity<String> response = vectorDBController.clearVectorDB();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).contains("cleared successfully");
        verify(chromaVectorStore).doDelete(Arrays.asList("1", "2"));
    }


    @Test
    public void testUploadToVectorDB() throws Exception {
        // Arrange
        String fileName = "test.txt";
        String content = "Test content";
        String token = "Bearer test-token";
        Long userId = 1L;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                fileName,
                "text/plain",
                content.getBytes()
        );

        // 创建测试文档
        Document testDoc = new Document(content, Collections.singletonMap("id", "1"));
        List<Document> documents = Collections.singletonList(testDoc);

        // Mock TokenTextSplitter
        when(tokenTextSplitter.apply(any())).thenReturn(documents);

        // Mock getCurrentUserId
        when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);

        // Mock S3 upload
        doNothing().when(s3Service).uploadFile(
                eq(userId),
                any(InputStream.class),
                anyLong(),
                eq("text/plain"),
                eq(fileName)
        );

        // Act
        vectorDBController.UploadToVectorDB(file, token);

        // Assert
        verify(chromaVectorStore).doAdd(any());
        verify(s3Service).uploadFile(
                eq(userId),
                any(InputStream.class),
                anyLong(),
                eq("text/plain"),
                eq(fileName)
        );

        // 验证文档ID是否被正确保存
        Field fileDocumentIdsMapField = VectorDBController.class.getDeclaredField("fileDocumentIdsMap");
        fileDocumentIdsMapField.setAccessible(true);
        Map<String, List<String>> fileDocumentIdsMap = (Map<String, List<String>>) fileDocumentIdsMapField.get(vectorDBController);

        assertThat(fileDocumentIdsMap).containsKey(fileName);
        List<String> savedDocumentIds = fileDocumentIdsMap.get(fileName);
        assertThat(savedDocumentIds).isNotEmpty();
    }

    @Test
    public void testUploadToVectorDB_EmptyFile() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.txt",
                "text/plain",
                new byte[0]
        );

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            vectorDBController.UploadToVectorDB(emptyFile, "Bearer test-token");
        });

        assertThat(exception.getMessage()).isEqualTo("Uploaded file is empty");
    }

    @Test
    public void testUploadToVectorDB_S3UploadFailure() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Test content".getBytes()
        );

        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);
        doThrow(new RuntimeException("S3 upload failed"))
                .when(s3Service)
                .uploadFile(anyLong(), any(), anyLong(), anyString(), anyString());

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            vectorDBController.UploadToVectorDB(file, "Bearer test-token");
        });

        assertThat(exception.getMessage()).contains("Failed to upload file to S3");
    }
}
