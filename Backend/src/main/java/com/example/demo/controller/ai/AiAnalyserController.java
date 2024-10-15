package com.example.demo.controller.ai;

import com.example.demo.model.Ai.AnalyseRequest;
import com.example.demo.service.AI.AiAnalyserService;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.utility.Parser.PromptParser;
import com.example.demo.utility.Redis.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AiAnalyserController {
    public final AiAnalyserService aiAnalyserService;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final TransactionRecordService transactionRecordService;
    public final SimpMessagingTemplate messagingTemplate;
    @Autowired
    public AiAnalyserController(AiAnalyserService aiAnalyserService, GetCurrentUserInfo getCurrentUserInfo, TransactionRecordService transactionRecordService, SimpMessagingTemplate messagingTemplate) {
        this.aiAnalyserService = aiAnalyserService;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.transactionRecordService = transactionRecordService;
        this.messagingTemplate = messagingTemplate;
    }

    @RabbitListener(queues = "new.record.to.ai.analyser")
    public void handleCurrentRecordAnalyse(AnalyseRequest request) {

        String currentRecord = request.getContent();
        long accountId = request.getAccountId();
        String recentRecords = PromptParser.parseLatestTransactionRecordsToPrompt(transactionRecordService.getCertainDaysRecords(accountId, 10));
        String result =  aiAnalyserService.analyseCurrentRecord(currentRecord, recentRecords);
        messagingTemplate.convertAndSend("/topic/analysis-result/" + accountId, result);
    }

    @RabbitListener(queues = "new.record.to.ai.analyser")
    public void String (String message) {
        ;
    }

}
