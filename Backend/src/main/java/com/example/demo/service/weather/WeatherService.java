package com.example.demo.service.weather;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class WeatherService {
    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String BASE_URL = "http://api.weatherapi.com/v1";

    @Autowired
    public WeatherService(RestTemplate restTemplate, @Qualifier("weatherApiKey") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }


    public JsonNode getCurrentWeather(String location) {
        String url = String.format("%s/current.json?key=%s&q=%s", BASE_URL, apiKey, location);
        try {
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching current weather for {}: {}", location, e.getMessage());
            throw new RuntimeException("Weather service error", e);
        }
    }


    public JsonNode getForecast(String location, int days) {
        String url = String.format("%s/forecast.json?key=%s&q=%s&days=%d", BASE_URL, apiKey, location, days);
        try {
            ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching forecast for {}: {}", location, e.getMessage());
            throw new RuntimeException("Weather service error", e);
        }
    }


}