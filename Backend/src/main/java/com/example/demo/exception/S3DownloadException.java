package com.example.demo.exception;

public class S3DownloadException extends Exception {
    public S3DownloadException(String message, Throwable cause) {
        super(message, cause);
    }
}
