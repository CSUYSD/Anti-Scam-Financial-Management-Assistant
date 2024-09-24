package com.example.demo.utility;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Bean
    public Queue messageQueue() {
        return new Queue("message_queue", false);
    }

    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend("message_queue", message);
    }
}
