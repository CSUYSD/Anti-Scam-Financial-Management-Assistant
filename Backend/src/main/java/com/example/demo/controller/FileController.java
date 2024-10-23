package com.example.demo.controller;

import com.example.demo.exception.S3DownloadException;
import com.example.demo.service.aws.S3Service;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.InputStream;

@RestController
@RequestMapping("/file")
@Slf4j
public class FileController {

    private final GetCurrentUserInfo getCurrentUserInfo;
    private final S3Service s3Service;

    public FileController(GetCurrentUserInfo getCurrentUserInfo, S3Service s3Service) {
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.s3Service = s3Service;
    }

    @GetMapping("/download")
    public ResponseEntity<InputStreamResource> getUserFileByFileName(@RequestHeader("Authorization") String token, @RequestParam String fileName) {
        try{
            Long userId = getCurrentUserInfo.getCurrentUserId(token);
            InputStream s3ServiceResponse = s3Service.downloadFile(userId, fileName);
            InputStreamResource resource = new InputStreamResource(s3ServiceResponse);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (S3DownloadException | FileNotFoundException e) {
            log.error("filed to down load file from S3", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get-all-name")
    public ResponseEntity<String[]> getAllFileNames(@RequestHeader("Authorization") String token) {
        try{
            Long userId = getCurrentUserInfo.getCurrentUserId(token);
            String[] fileNames = s3Service.getAllFileNames(userId);
            return ResponseEntity.ok(fileNames);
        } catch (Exception e) {
            log.error("Failed to get all file names", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestHeader("Authorization") String token, @RequestParam String fileName) {
        try{
            Long userId = getCurrentUserInfo.getCurrentUserId(token);
            s3Service.deleteFile(userId, fileName);
            return ResponseEntity.ok("File " + fileName + "deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete file", e);
            return ResponseEntity.badRequest().build();
        }
    }

}
