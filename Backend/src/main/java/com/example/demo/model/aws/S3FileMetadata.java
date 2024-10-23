package com.example.demo.model.aws;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class S3FileMetadata {
    private String key;
    private String fileName;
    private Long size;
    private Date lastModified;
    private String storageClass;
    private String owner;
    private String etag;
}