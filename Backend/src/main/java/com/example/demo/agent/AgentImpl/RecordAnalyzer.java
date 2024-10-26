package com.example.demo.agent.AgentImpl;

import com.example.demo.agent.Agent;
import com.example.demo.agent.AbstractAgent;
import com.example.demo.model.dto.TransactionRecordDTO;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.service.weather.WeatherService;
import com.example.demo.utility.converter.PromptConverter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Agent
@Description("provide user request data")
public class RecordAnalyzer extends AbstractAgent<RecordAnalyzer.Request, String> {

    protected RecordAnalyzer(ChatModel chatModel) {
        super(chatModel);
    }

    public record Request(
            @JsonProperty(required = true) @JsonPropertyDescription("user message") String content
    ) {}

    @Override
    public String apply(Request request) {

        return getChatClient()
                .prompt()
                .user(request.content)
                .call()
                .content();
    }

    @Component("recent_records_reader")
    @Description("get user's recent records from database")
    public static class RecentRecordsReader implements Function<RecentRecordsReader.Request, String> {
        private final TransactionRecordService recordService;

        @Autowired
        public RecentRecordsReader(TransactionRecordService recordService1) {
            this.recordService = recordService1;
        }

        @Override
        public String apply(Request request) {
            List<TransactionRecordDTO> recentRecords = recordService
                    .getCertainDaysRecords(Long.valueOf(request.accountId), 20)
                    .stream()
                    .limit(20)
                    .collect(Collectors.toList());

            return PromptConverter.parseRecentTransactionRecordsToPrompt(recentRecords);
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("user's account id")
                String accountId,
                @JsonProperty(required = true)
                @JsonPropertyDescription("user requirement")
                String message
        ) {}


    }

    @Component("current_weather_reader")
    @Description("get current weather information for user's location")
    public static class CurrentWeatherReader implements Function<CurrentWeatherReader.Request, String> {
        private final WeatherService weatherService;
        private static final String DEFAULT_LOCATION = "Sydney,AU";

        @Autowired
        public CurrentWeatherReader(WeatherService weatherService) {
            this.weatherService = weatherService;
        }

        @Override
        public String apply(Request request) {
            String location = (request.location == null || request.location.trim().isEmpty())
                    ? DEFAULT_LOCATION
                    : request.location.trim();
            JsonNode weatherData = weatherService.getCurrentWeather(location);
            return formatWeatherResponse(weatherData);
        }

        private String formatWeatherResponse(JsonNode data) {
            JsonNode current = data.get("current");
            return String.format(
                    "Current weather in %s: \n" +
                            "Temperature: %.1f°C\n" +
                            "Feels like: %.1f°C\n" +
                            "Condition: %s\n" +
                            "Humidity: %d%%\n" +
                            "Wind: %.1f km/h %s\n" +
                            "Precipitation: %.1f mm",
                    data.get("location").get("name").asText(),
                    current.get("temp_c").asDouble(),
                    current.get("feelslike_c").asDouble(),
                    current.get("condition").get("text").asText(),
                    current.get("humidity").asInt(),
                    current.get("wind_kph").asDouble(),
                    current.get("wind_dir").asText(),
                    current.get("precip_mm").asDouble()
            );
        }

        public record Request(
                @JsonProperty(required = false)
                @JsonPropertyDescription("location name or coordinates")
                String location,

                @JsonProperty(required = true)
                @JsonPropertyDescription("user's weather query")
                String query
        ) {}
    }

    @Component("weather_forecast_reader")
    @Description("get weather forecast for specified days")
    public static class WeatherForecastReader implements Function<WeatherForecastReader.Request, String> {
        private final WeatherService weatherService;
        private static final String DEFAULT_LOCATION = "Sydney,AU";
        private static final int DEFAULT_DAYS = 3;

        @Autowired
        public WeatherForecastReader(WeatherService weatherService) {
            this.weatherService = weatherService;
        }

        @Override
        public String apply(Request request) {
            String location = (request.location == null || request.location.trim().isEmpty())
                    ? DEFAULT_LOCATION
                    : request.location.trim();

            // if request days is invalid
            int days = request.days <= 0 ? DEFAULT_DAYS : Math.min(request.days, 3);

            JsonNode forecastData = weatherService.getForecast(request.location, days);
            return formatForecastResponse(forecastData);
        }

        private String formatForecastResponse(JsonNode data) {
            StringBuilder forecast = new StringBuilder();
            JsonNode forecastDays = data.get("forecast").get("forecastday");

            forecast.append(String.format("Weather forecast for %s:\n\n",
                    data.get("location").get("name").asText()));

            for (JsonNode day : forecastDays) {
                JsonNode dayData = day.get("day");
                forecast.append(String.format(
                        "Date: %s\n" +
                                "Max Temperature: %.1f°C\n" +
                                "Min Temperature: %.1f°C\n" +
                                "Average Temperature: %.1f°C\n" +
                                "Condition: %s\n" +
                                "Rain Chance: %d%%\n" +
                                "Max Wind: %.1f km/h\n" +
                                "Total Precipitation: %.1f mm\n\n",
                        day.get("date").asText(),
                        dayData.get("maxtemp_c").asDouble(),
                        dayData.get("mintemp_c").asDouble(),
                        dayData.get("avgtemp_c").asDouble(),
                        dayData.get("condition").get("text").asText(),
                        dayData.get("daily_chance_of_rain").asInt(),
                        dayData.get("maxwind_kph").asDouble(),
                        dayData.get("totalprecip_mm").asDouble()
                ));
            }
            return forecast.toString();
        }

        public record Request(
                @JsonProperty(required = false)
                @JsonPropertyDescription("location name or coordinates")
                String location,

                @JsonProperty(required = false)
                @JsonPropertyDescription("number of days for forecast (1-3)")
                int days,

                @JsonProperty(required = true)
                @JsonPropertyDescription("user's weather query")
                String query
        ) {}
    }
}