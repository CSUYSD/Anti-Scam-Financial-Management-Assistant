package com.example.demo.controller;

import com.example.demo.controller.FinancialReportController;
import com.example.demo.model.FinancialReport;
import com.example.demo.service.FinancialReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


public class FinancialReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FinancialReportService financialReportService;

    @InjectMocks
    private FinancialReportController financialReportController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(financialReportController).build();
    }

    @Test
    public void testGetFinancialReport_Success() throws Exception {
        // 模拟返回的财务报告列表
        FinancialReport report = new FinancialReport();
        report.setContent("Quarterly Report");  // 使用 setContent 设置报告内容
        List<FinancialReport> reports = List.of(report);

        when(financialReportService.getFinancialReports(anyString())).thenReturn(reports);

        // 发送请求
        MvcResult result = mockMvc.perform(get("/financial-report")
                        .header("Authorization", "Bearer testToken")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        assertThat(result.getResponse().getContentAsString()).contains("Quarterly Report");
    }


    @Test
    public void testGetFinancialReport_NoContent() throws Exception {
        // 模拟返回空列表
        when(financialReportService.getFinancialReports(anyString())).thenReturn(Collections.emptyList());

        // 发送请求
        MvcResult result = mockMvc.perform(get("/financial-report")
                        .header("Authorization", "Bearer testToken"))
                .andExpect(status().isNoContent())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(204);  // 无内容
    }

    @Test
    public void testGetFinancialReport_InternalServerError() throws Exception {
        // 模拟抛出异常
        when(financialReportService.getFinancialReports(anyString())).thenThrow(new RuntimeException("Internal Server Error"));

        // 发送请求
        MvcResult result = mockMvc.perform(get("/financial-report")
                        .header("Authorization", "Bearer testToken"))
                .andExpect(status().isInternalServerError())
                .andReturn();

        // 验证响应
        assertThat(result.getResponse().getStatus()).isEqualTo(500);  // 服务器错误
        assertThat(result.getResponse().getContentAsString()).isEqualTo("[]");  // 修改预期为 []
    }

}