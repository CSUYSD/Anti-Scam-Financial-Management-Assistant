package com.example.demo.config.weather;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class WeatherApiConfig {
    @Value("${weather.api.key}")
    private String apiKey;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public String weatherApiKey() {
        return apiKey;
    }
}