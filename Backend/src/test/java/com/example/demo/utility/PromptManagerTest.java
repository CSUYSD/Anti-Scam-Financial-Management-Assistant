package com.example.demo.utility;

import com.google.common.truth.Truth;
import org.mockito.MockitoAnnotations;

public class PromptManagerTest {

    private PromptManager promptManager;

    public static void main(String[] args) throws Exception {
        PromptManagerTest test = new PromptManagerTest();
        test.setup();
        test.testGetFinancialReportContext();
        test.testGetFinancialReportPrompt();
        System.out.println("All tests passed!");
    }

    public void setup() {
        MockitoAnnotations.openMocks(this);
        promptManager = new PromptManager();
    }

    public void testGetFinancialReportContext() {
        // Act
        String result = promptManager.getFinancialReportContext();

        // Assert
        Truth.assertThat(result).isNotNull();
        Truth.assertThat(result).contains("Below is the context information");
        Truth.assertThat(result).contains("{question_answer_context}");
        System.out.println("testGetFinancialReportContext passed!");
    }

    public void testGetFinancialReportPrompt() {
        // Arrange
        String recentRecords = "Test Records";

        // Act
        String result = promptManager.getFinancialReportPrompt(recentRecords);

        // Assert
        Truth.assertThat(result).isNotNull();
        Truth.assertThat(result).contains("Test Records");
        Truth.assertThat(result).contains("As the user's personal financial advisor");
        Truth.assertThat(result).contains("Key Observations");
        Truth.assertThat(result).contains("Areas for Improvement");
        Truth.assertThat(result).contains("Financial Recommendations");
        System.out.println("testGetFinancialReportPrompt passed!");
    }
}