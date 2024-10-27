package com.example.demo.listener;

import com.example.demo.model.message.AnalyseRequest;
import com.example.demo.service.ai.AiAnalyserService;
import com.example.demo.service.TransactionRecordService;
import com.example.demo.utility.converter.PromptConverter;
import com.example.demo.utility.GetCurrentUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WarningRecordAnalyser {
    public final AiAnalyserService aiAnalyserService;
    public final GetCurrentUserInfo getCurrentUserInfo;
    public final TransactionRecordService transactionRecordService;
    public final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WarningRecordAnalyser(AiAnalyserService aiAnalyserService, GetCurrentUserInfo getCurrentUserInfo, TransactionRecordService transactionRecordService, SimpMessagingTemplate messagingTemplate) {
        this.aiAnalyserService = aiAnalyserService;
        this.getCurrentUserInfo = getCurrentUserInfo;
        this.transactionRecordService = transactionRecordService;
        this.messagingTemplate = messagingTemplate;
        log.info("WarningRecordAnalyser initialized with dependencies");
    }

    @RabbitListener(queues = "new.record.to.ai.analyser")
    public void handleCurrentRecordAnalyse(AnalyseRequest request) {
        log.info("Received AnalyseRequest for accountId: {}", request.getAccountId());

        String currentRecord = request.getContent();
        long accountId = request.getAccountId();
        log.debug("Processing current record: {}", currentRecord);
        log.info("Fetching recent records for accountId: {}", accountId);
        String recentRecords = PromptConverter.parseRecentTransactionRecordsToPrompt(transactionRecordService.getCertainDaysRecords(accountId, 10), false);
        log.info("Recent records parsed: {}", recentRecords);

        log.info("Analyzing current record with AI service");
        String result = aiAnalyserService.analyseCurrentRecord(currentRecord, recentRecords);
        log.info("Analysis result: {}", result);

        String destination = "/topic/analysis-result/" + accountId;
        log.info("Sending analysis result to WebSocket destination: {}", destination);
        try {
            messagingTemplate.convertAndSend(destination, result);
            log.info("Analysis result sent successfully to accountId: {}", accountId);
        } catch (Exception e) {
            log.error("Error sending analysis result to WebSocket for accountId: {}", accountId, e);
        }
    }


}