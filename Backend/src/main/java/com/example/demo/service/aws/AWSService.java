package com.example.demo.service.aws;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class AWSService {
    private final AmazonS3 amazonS3;
    @Autowired
    public AWSService(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Async
    public void uploadFile(Long userId, InputStream inputStream, long contentLength, String contentType, String fileName) {
        try {
            String s3Key = AWSService.generateS3Key(userId, fileName);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentLength);
            metadata.setContentType(contentType);

            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3Key, inputStream, metadata);
            amazonS3.putObject(putObjectRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public InputStream getFile(Long userId, String fileName) {
        try {
            String s3Key = AWSService.generateS3Key(userId, fileName);
            return amazonS3.getObject(bucketName, s3Key).getObjectContent();
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve file from S3", e);
        }
    }

    public String getFileUrl(String key) {
        return amazonS3.getUrl(bucketName, key).toString();
    }

    public static String generateS3Key(Long userId, String fileName) {
        return "user_" + userId + "/" + fileName;
    }
}
