package com.example.demo.model.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyseRequest implements Serializable {
    private Long accountId;
    private String content;
}
