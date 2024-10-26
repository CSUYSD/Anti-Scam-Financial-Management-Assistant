package com.example.demo.agent.AgentImpl;

import com.example.demo.agent.AbstractAgent;
import com.example.demo.agent.Agent;
import com.example.demo.service.stock.StockService;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Description;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Agent
@Description("provide user stock information")
public class StockAnalyzer extends AbstractAgent<StockAnalyzer.Request, String> {

    protected StockAnalyzer(ChatModel chatModel) {
        super(chatModel);
    }

    public record Request(
            @JsonProperty(required = true) @JsonPropertyDescription("user message") String content
    ) {}

    @Override
    public String apply(StockAnalyzer.Request request) {

        return getChatClient()
                .prompt()
                .user(request.content)
                .call()
                .content();
    }

    @Component("stock_price_reader")
    @Description("get current stock price information")
    public static class StockPriceReader implements Function<StockPriceReader.Request, String> {
        private final StockService stockService;

        @Autowired
        public StockPriceReader(StockService stockService) {
            this.stockService = stockService;
        }

        @Override
        public String apply(Request request) {
            try {
                if (request.symbol == null || request.symbol.trim().isEmpty()) {
                    return "Please provide a valid stock symbol.";
                }

                Map<String, Object> stockData = stockService.getStockPrice(request.symbol.trim().toUpperCase());

                return String.format(
                        "Stock data for %s:\n" +
                                "Date: %s\n" +
                                "Price: $%.2f\n" +
                                "Volume: %d\n" +
                                "Change: $%.2f",
                        stockData.get("symbol"),
                        stockData.get("lastUpdated"),
                        stockData.get("price"),
                        stockData.get("volume"),
                        stockData.get("change")
                );

            } catch (Exception e) {
                return "Failed to fetch stock data: " + e.getMessage();
            }
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("stock symbol (e.g., AAPL)")
                String symbol,

                @JsonProperty(required = true)
                @JsonPropertyDescription("user's stock query")
                String query
        ) {}
    }

    @Component("company_overview_reader")
    @Description("get company overview information")
    public static class CompanyOverviewReader implements Function<CompanyOverviewReader.Request, String> {
        private final StockService stockService;

        @Autowired
        public CompanyOverviewReader(StockService stockService) {
            this.stockService = stockService;
        }

        @Override
        public String apply(Request request) {
            try {
                if (request.symbol == null || request.symbol.trim().isEmpty()) {
                    return "Please provide a valid stock symbol.";
                }

                Map<String, Object> companyData = stockService.getCompanyOverview(request.symbol.trim().toUpperCase());

                return String.format(
                        "Company Overview:\n" +
                                "Symbol: %s\n" +
                                "Name: %s\n" +
                                "Industry: %s\n" +
                                "Description: %s\n" +
                                "Exchange: %s\n" +
                                "Market Cap: %s\n" +
                                "P/E Ratio: %s",
                        companyData.get("Symbol"),
                        companyData.get("Name"),
                        companyData.get("Industry"),
                        companyData.get("Description"),
                        companyData.get("Exchange"),
                        companyData.get("MarketCap"),
                        companyData.get("PERatio")
                );

            } catch (Exception e) {
                return "Failed to fetch company overview: " + e.getMessage();
            }
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("stock symbol (e.g., AAPL)")
                String symbol,

                @JsonProperty(required = true)
                @JsonPropertyDescription("user's company query")
                String query
        ) {}
    }

    @Component("stock_history_reader")
    @Description("get historical stock data")
    public static class StockHistoryReader implements Function<StockHistoryReader.Request, String> {
        private final StockService stockService;
        private static final int DEFAULT_DAYS = 5;

        @Autowired
        public StockHistoryReader(StockService stockService) {
            this.stockService = stockService;
        }

        @Override
        public String apply(Request request) {
            try {
                if (request.symbol == null || request.symbol.trim().isEmpty()) {
                    return "Please provide a valid stock symbol.";
                }

                int days = request.days <= 0 ? DEFAULT_DAYS : request.days;
                List<Map<String, Object>> historyData = stockService.getStockHistory(
                        request.symbol.trim().toUpperCase(),
                        days
                );

                StringBuilder history = new StringBuilder();
                history.append(String.format("Historical data for %s (Last %d days):\n\n",
                        request.symbol.toUpperCase(), days));

                for (Map<String, Object> day : historyData) {
                    history.append(String.format(
                            "Date: %s\n" +
                                    "Close: $%.2f\n" +
                                    "Open: $%.2f\n" +
                                    "High: $%.2f\n" +
                                    "Low: $%.2f\n" +
                                    "Volume: %d\n\n",
                            day.get("date"),
                            day.get("close"),
                            day.get("open"),
                            day.get("high"),
                            day.get("low"),
                            day.get("volume")
                    ));
                }

                return history.toString();

            } catch (Exception e) {
                return "Failed to fetch stock history: " + e.getMessage();
            }
        }

        public record Request(
                @JsonProperty(required = true)
                @JsonPropertyDescription("stock symbol (e.g., AAPL)")
                String symbol,

                @JsonProperty(required = false)
                @JsonPropertyDescription("number of days of historical data (default: 5)")
                int days,

                @JsonProperty(required = true)
                @JsonPropertyDescription("user's history query")
                String query
        ) {}
    }
}
