//package com.example.demo.config.Redis;
//
//import lombok.AllArgsConstructor;
//import org.springframework.ai.autoconfigure.vectorstore.redis.RedisVectorStoreAutoConfiguration;
//import org.springframework.ai.autoconfigure.vectorstore.redis.RedisVectorStoreProperties;
//import org.springframework.ai.embedding.EmbeddingModel;
//import org.springframework.ai.vectorstore.RedisVectorStore;
//import org.springframework.ai.vectorstore.VectorStore;
//import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
//import org.springframework.boot.autoconfigure.data.redis.RedisConnectionDetails;
//import org.springframework.boot.context.properties.EnableConfigurationProperties;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import redis.clients.jedis.JedisPooled;
//
//@Configuration
//// 禁用SpringAI提供的RedisStack向量数据库的自动配置，会和Redis的配置冲突。
//@EnableAutoConfiguration(exclude = {RedisVectorStoreAutoConfiguration.class})
//// 读取RedisStack的配置信息
//@EnableConfigurationProperties({RedisVectorStoreProperties.class})
//@AllArgsConstructor
//public class RedisVector{
//
//    /**
//     * 创建RedisStack向量数据库
//     *
//     * @param embeddingModel 嵌入模型
//     * @param properties     redis-stack的配置信息
//     * @return vectorStore 向量数据库
//     */
//    @Bean
//    public VectorStore vectorStore(EmbeddingModel embeddingModel,
//                                   RedisVectorStoreProperties properties,
//                                   RedisConnectionDetails redisConnectionDetails) {
//        RedisVectorStore.RedisVectorStoreConfig config = RedisVectorStore.RedisVectorStoreConfig.builder()
//                .withIndexName(properties.getIndex())
//                .withPrefix(properties.getPrefix())
//                .build();
//
//        return new RedisVectorStore(config, embeddingModel,
//                new JedisPooled("localhost", 6380, null, "123456"),
//                true);
//    }
//}
