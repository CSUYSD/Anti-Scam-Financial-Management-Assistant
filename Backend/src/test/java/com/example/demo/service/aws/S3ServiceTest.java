package com.example.demo.service.aws;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.example.demo.exception.S3DownloadException;
import com.example.demo.model.aws.S3FileMetadata;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class S3ServiceTest {

    @Mock
    private AmazonS3 amazonS3;

    @InjectMocks
    private S3Service s3Service;

    private final String bucketName = "test-bucket";

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        // 使用反射设置bucketName
        try {
            java.lang.reflect.Field bucketField = S3Service.class.getDeclaredField("bucketName");
            bucketField.setAccessible(true);
            bucketField.set(s3Service, bucketName);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Test
    public void testUploadFile() {
        // Arrange
        Long userId = 1L;
        InputStream inputStream = mock(InputStream.class);
        long contentLength = 100L;
        String contentType = "text/plain";
        String fileName = "test.txt";

        // Act
        s3Service.uploadFile(userId, inputStream, contentLength, contentType, fileName);

        // Assert
        String expectedKey = S3Service.generateS3Key(userId, fileName);
        verify(amazonS3).putObject(any());
    }

    @Test
    public void testDownloadFile() throws S3DownloadException, FileNotFoundException {
        // Arrange
        Long userId = 1L;
        String fileName = "test.txt";
        S3Object mockS3Object = mock(S3Object.class);
        S3ObjectInputStream mockInputStream = mock(S3ObjectInputStream.class);

        when(amazonS3.getObject(bucketName, S3Service.generateS3Key(userId, fileName))).thenReturn(mockS3Object);
        when(mockS3Object.getObjectContent()).thenReturn(mockInputStream);

        // Act
        InputStream result = s3Service.downloadFile(userId, fileName);

        // Assert
        assertThat(result).isNotNull();
        verify(amazonS3).getObject(bucketName, S3Service.generateS3Key(userId, fileName));
    }

//    @Test
//    public void testGetAllFileNames() {
//        // Arrange
//        Long userId = 1L;
//        ObjectListing mockObjectListing = mock(ObjectListing.class);
//        S3ObjectSummary mockSummary = mock(S3ObjectSummary.class);
//
//        // Mock the behavior of amazonS3.listObjects() and return the mockObjectListing
//        when(amazonS3.listObjects(bucketName)).thenReturn(mockObjectListing);
//
//        // Mock the behavior of getObjectSummaries() to return a list with one mock summary
//        List<S3ObjectSummary> summaries = new ArrayList<>();
//        summaries.add(mockSummary);
//        when(mockObjectListing.getObjectSummaries()).thenReturn(summaries);
//
//        // Act
//        List<S3FileMetadata> result = s3Service.getAllFileNames(userId);
//
//        // Assert
//        assertThat(result).isNotEmpty(); // 根据你的逻辑进行断言
//    }

    @Test
    public void testDeleteFile() {
        // Arrange
        Long userId = 1L;
        String fileName = "test.txt";

        // Act
        s3Service.deleteFile(userId, fileName);

        // Assert
        verify(amazonS3).deleteObject(bucketName, S3Service.generateS3Key(userId, fileName));
    }
}