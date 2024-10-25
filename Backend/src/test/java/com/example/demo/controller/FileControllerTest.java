package com.example.demo.controller;

import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.example.demo.controller.FileController;
import com.example.demo.exception.S3DownloadException;
import com.example.demo.service.aws.S3Service;
import com.example.demo.utility.GetCurrentUserInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(MockitoJUnitRunner.class)
public class FileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;

    @Mock
    private S3Service s3Service;

    @InjectMocks
    private FileController fileController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);  // 确保开启mock的注入
        mockMvc = MockMvcBuilders.standaloneSetup(fileController).build();
    }

    @Test
    public void testGetUserFileByFileName_Success() throws Exception {
        // 模拟返回用户ID
        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);

        // 模拟S3ObjectInputStream返回
        InputStream inputStream = new ByteArrayInputStream("Test file content".getBytes());
        S3ObjectInputStream s3InputStream = new S3ObjectInputStream(inputStream, null);
        when(s3Service.downloadFile(anyLong(), anyString())).thenReturn(s3InputStream);

        // 发送请求
        MvcResult result = mockMvc.perform(get("/file/download")
                        .header("Authorization", "Bearer testToken")
                        .param("fileName", "testFile.txt"))
                .andExpect(status().isOk())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(result.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION)).isEqualTo("attachment; filename=\"testFile.txt\"");
        assertThat(result.getResponse().getContentAsString()).isEqualTo("Test file content");
    }

    @Test
    public void testGetUserFileByFileName_FileNotFound() throws Exception {
        // 模拟返回用户ID
        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);

        // 模拟抛出 FileNotFoundException
        when(s3Service.downloadFile(anyLong(), anyString())).thenThrow(new FileNotFoundException());

        // 发送请求
        MvcResult result = mockMvc.perform(get("/file/download")
                        .header("Authorization", "Bearer testToken")
                        .param("fileName", "nonExistingFile.txt"))
                .andExpect(status().isBadRequest())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(400);
    }

//    @Test
//    public void testGetAllFileNames_Success() throws Exception {
//        // 模拟返回用户ID
//        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);
//
//        // 模拟 S3 返回的文件名列表
//        List<String> fileNames = Arrays.asList("file1.txt", "file2.txt");
//        when(s3Service.getAllFileNames(anyLong())).thenReturn(fileNames);
//
//        // 发送请求
//        MvcResult result = mockMvc.perform(get("/file/get-all-name")
//                        .header("Authorization", "Bearer testToken"))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        // 验证响应
//        assertThat(result.getResponse().getStatus()).isEqualTo(200);
//        assertThat(result.getResponse().getContentAsString()).isEqualTo("[\"file1.txt\",\"file2.txt\"]");
//    }

    @Test
    public void testDeleteFile_Success() throws Exception {
        // 模拟返回用户ID
        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);

        // 模拟删除文件成功
        doNothing().when(s3Service).deleteFile(anyLong(), anyString());

        // 发送请求
        MvcResult result = mockMvc.perform(post("/file/delete")
                        .header("Authorization", "Bearer testToken")
                        .param("fileName", "testFile.txt"))
                .andExpect(status().isOk())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(result.getResponse().getContentAsString()).isEqualTo("File testFile.txtdeleted successfully");
    }

    @Test
    public void testDeleteFile_Failure() throws Exception {
        // 模拟返回用户ID
        when(getCurrentUserInfo.getCurrentUserId(anyString())).thenReturn(1L);

        // 模拟删除文件失败
        doThrow(new RuntimeException("Failed to delete file")).when(s3Service).deleteFile(anyLong(), anyString());

        // 发送请求
        MvcResult result = mockMvc.perform(post("/file/delete")
                        .header("Authorization", "Bearer testToken")
                        .param("fileName", "testFile.txt"))
                .andExpect(status().isBadRequest())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(400);
    }
}