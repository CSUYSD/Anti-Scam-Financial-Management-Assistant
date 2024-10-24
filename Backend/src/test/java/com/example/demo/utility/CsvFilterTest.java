package com.example.demo.utility;

import com.example.demo.model.TransactionRecord;
import com.google.common.truth.Truth;
import org.mockito.MockitoAnnotations;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class CsvFilterTest {

    private CsvFilter csvFilter;
    private static final String TEST_CSV_PATH = "test.csv";

    public static void main(String[] args) throws Exception {
        CsvFilterTest test = new CsvFilterTest();
        test.setup();
        test.testImportCsvSuccess();
        test.testImportCsvWithMissingColumns();
        test.testImportCsvWithEmptyFile();
        test.testImportCsvWithInvalidPath();
        System.out.println("All tests passed!");
    }

    public void setup() {
        MockitoAnnotations.openMocks(this);
        csvFilter = new CsvFilter();
    }

    public void testImportCsvSuccess() throws Exception {
        // Arrange
        createTestCsvFile(
                "交易类型,金额(元),交易时间\n" +
                        "支出,100,2024-01-01\n" +
                        "收入,200,2024-01-02"
        );

        // Act
        List<TransactionRecord> records = csvFilter.importCsv(TEST_CSV_PATH);

        // Assert
        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).isNotEmpty();
        Truth.assertThat(records.size()).isEqualTo(2);
        System.out.println("testImportCsvSuccess passed!");

        // Cleanup
        cleanupTestFile();
    }

    public void testImportCsvWithMissingColumns() throws Exception {
        // Arrange
        createTestCsvFile(
                "其他列1,其他列2\n" +
                        "值1,值2"
        );

        // Act
        List<TransactionRecord> records = csvFilter.importCsv(TEST_CSV_PATH);

        // Assert
        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).isNotEmpty();  // 即使缺少列，也应该创建记录
        System.out.println("testImportCsvWithMissingColumns passed!");

        // Cleanup
        cleanupTestFile();
    }

    public void testImportCsvWithEmptyFile() throws Exception {
        // Arrange
        createTestCsvFile("");

        // Act
        List<TransactionRecord> records = csvFilter.importCsv(TEST_CSV_PATH);

        // Assert
        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).isEmpty();
        System.out.println("testImportCsvWithEmptyFile passed!");

        // Cleanup
        cleanupTestFile();
    }

    public void testImportCsvWithInvalidPath() throws Exception {
        // Act
        List<TransactionRecord> records = csvFilter.importCsv("invalid/path/file.csv");

        // Assert
        Truth.assertThat(records).isNotNull();
        Truth.assertThat(records).isEmpty();
        System.out.println("testImportCsvWithInvalidPath passed!");
    }

    private void createTestCsvFile(String content) throws IOException {
        try (FileWriter writer = new FileWriter(TEST_CSV_PATH)) {
            writer.write(content);
        }
    }

    private void cleanupTestFile() {
        File file = new File(TEST_CSV_PATH);
        if (file.exists()) {
            file.delete();
        }
    }
}