package com.example.demo;


import org.springframework.ai.chroma.ChromaApi;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestClient;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

import java.util.HashMap;
import java.util.function.Consumer;

@SpringBootApplication
@EnableAsync
@EnableElasticsearchRepositories
@EnableJpaRepositories
@EnableWebSocket
public class DemoApplication {
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
	@Bean
	public ObjectMapper objectMapper() {
		ObjectMapper objectMapper = new ObjectMapper();
		// Register JavaTimeModule to support the new Date and Time API in Java 8+
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		return objectMapper;
	}

	@Value("${spring.ai.openai.api-key}")
	private String openAiApiKey;


	@Bean
	public EmbeddingModel embeddingModel() {
		// Can be any other EmbeddingModel implementation.
		return new OpenAiEmbeddingModel(new OpenAiApi(openAiApiKey));
	}

	@Value("http://localhost:8080")
	private String ChromaBaseUrl;
	RestClient restClient;
	ObjectMapper objectMapper;

//	@Bean
//	public  generateChromaCollection(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
//		Consumer<HttpHeaders> defaultHeaders = headers -> {
//			headers.setContentType(MediaType.APPLICATION_JSON);
//		};
//		this.objectMapper = objectMapper;
//		this.restClient = restClientBuilder.baseUrl(ChromaBaseUrl).defaultHeaders(defaultHeaders).build();
//		ChromaApi.CreateCollectionRequest request = new ChromaApi.CreateCollectionRequest("test", new HashMap<>());
//	}


}
