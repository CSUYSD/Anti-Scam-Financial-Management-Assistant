package com.example.demo.model.ai;


import lombok.Data;

import java.util.Map;

@Data
public class AiMessageWrapper {
    private InputMessage inputMessage;
    private ChatParameters params;
}
