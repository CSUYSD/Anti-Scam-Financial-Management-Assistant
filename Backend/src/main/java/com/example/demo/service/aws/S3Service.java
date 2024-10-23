package com.example.demo.service.aws;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import com.example.demo.exception.S3DownloadException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.InputStream;

@Service
@Slf4j
public class S3Service {
    private final AmazonS3 amazonS3;
    @Autowired
    public S3Service(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Async
    public void uploadFile(Long userId, InputStream inputStream, long contentLength, String contentType, String fileName) {
        try {
            String s3Key = S3Service.generateS3Key(userId, fileName);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentLength);
            metadata.setContentType(contentType);

            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3Key, inputStream, metadata);
            amazonS3.putObject(putObjectRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public S3ObjectInputStream downloadFile(Long userId, String fileName) throws S3DownloadException, FileNotFoundException {
        String s3Key = S3Service.generateS3Key(userId, fileName);
        try {
            S3Object s3Object = amazonS3.getObject(bucketName, s3Key);
            // Log successful download
            log.info("File successfully retrieved from S3. Bucket: {}, Key: {}", bucketName, s3Key);
            return s3Object.getObjectContent();
        } catch (AmazonS3Exception e) {
            if (e.getStatusCode() == 404) {
                log.error("File not found in S3. Bucket: {}, Key: {}", bucketName, s3Key);
                throw new FileNotFoundException("File not found in S3: " + fileName);
            } else {
                log.error("S3 error occurred while downloading file. Bucket: {}, Key: {}, Error: {}",
                        bucketName, s3Key, e.getMessage());
                throw new S3DownloadException("Failed to retrieve file from S3", e);
            }
        } catch (Exception e) {
            log.error("Unexpected error occurred while downloading file from S3. Bucket: {}, Key: {}, Error: {}",
                    bucketName, s3Key, e.getMessage());
            throw new S3DownloadException("Failed to retrieve file from S3", e);
        }
    }


    public String getFileUrl(String key) {
        return amazonS3.getUrl(bucketName, key).toString();
    }

    public static String generateS3Key(Long userId, String fileName) {
        return "user_" + userId + "/" + fileName;
    }
}
