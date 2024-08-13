package com.example.demo.utility;

import com.example.demo.model.TransactionRecord;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CsvFilter {

    public List<TransactionRecord> importCsv(String filePath) {
        List<TransactionRecord> records = new ArrayList<>();

        try (CSVReader csvReader = new CSVReader(new FileReader(filePath))) {
            String[] headers = csvReader.readNext();  // 读取第一行，假设是列标题
            String[] values;

            while ((values = csvReader.readNext()) != null) {
                // 假设我们需要 "交易类型", "金额(元)", 和 "交易时间" 这几列
                int transactionTypeIndex = findColumnIndex(headers, "交易类型");
                int amountIndex = findColumnIndex(headers, "金额(元)");
                int transactionTimeIndex = findColumnIndex(headers, "交易时间");

                String transactionType = transactionTypeIndex != -1 ? values[transactionTypeIndex] : null;
                String amount = amountIndex != -1 ? values[amountIndex] : null;
                String transactionTime = transactionTimeIndex != -1 ? values[transactionTimeIndex] : null;

                // 使用 record 生成的构造函数创建实例
                TransactionRecord record = new TransactionRecord();

                records.add(record);
            }

        } catch (IOException | CsvValidationException e) {
            e.printStackTrace();
        }

        return records;
    }

    private int findColumnIndex(String[] headers, String columnName) {
        for (int i = 0; i < headers.length; i++) {
            if (headers[i].equals(columnName)) {
                return i;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        CsvFilter importer = new CsvFilter();
        List<TransactionRecord> records = importer.importCsv("path/to/your/file.csv");

        // 输出导入的记录
        for (TransactionRecord record : records) {
            System.out.println(record);
        }
    }
}