package com.example.demo.model.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyseRequest implements Serializable {
    @JsonProperty("accountId")
    private Long accountId;
    @JsonProperty("content")
    private String content;
}
