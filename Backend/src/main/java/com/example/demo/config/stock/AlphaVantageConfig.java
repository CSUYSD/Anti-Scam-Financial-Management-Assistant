package com.example.demo.config.stock;

import com.crazzyghost.alphavantage.AlphaVantage;
import com.crazzyghost.alphavantage.Config;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class AlphaVantageConfig {

    @Value("${alphavantage.api.key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        try {
            Config cfg = Config.builder()
                    .key(apiKey)
                    .timeOut(10)
                    .build();

            AlphaVantage.api().init(cfg);
            log.info("AlphaVantage API initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize AlphaVantage API: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize AlphaVantage API", e);
        }
    }
}