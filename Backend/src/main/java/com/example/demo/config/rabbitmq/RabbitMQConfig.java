package com.example.demo.config.rabbitmq;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue orderStateToStoreQueue() {
        return new Queue("new.record.to.ai.analyser", true);
    }

}
