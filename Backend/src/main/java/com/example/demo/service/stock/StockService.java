package com.example.demo.service.stock;

import com.crazzyghost.alphavantage.AlphaVantage;
import com.crazzyghost.alphavantage.AlphaVantageException;
import com.crazzyghost.alphavantage.fundamentaldata.response.CompanyOverviewResponse;
import com.crazzyghost.alphavantage.parameters.OutputSize;
import com.crazzyghost.alphavantage.timeseries.response.StockUnit;
import com.crazzyghost.alphavantage.timeseries.response.TimeSeriesResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class StockService {

    /**
     * Get current stock price data
     * @param symbol Stock symbol code
     * @return Stock market data
     */
    public Map<String, Object> getStockPrice(String symbol) {
        try {
            TimeSeriesResponse response = AlphaVantage.api()
                    .timeSeries()
                    .daily()
                    .forSymbol(symbol)
                    .outputSize(OutputSize.COMPACT)
                    .fetchSync();

            List<StockUnit> stockUnits = response.getStockUnits();

            Map<String, Object> result = new HashMap<>();
            result.put("symbol", symbol);
            result.put("lastUpdated", stockUnits.get(0).getDate());
            result.put("price", stockUnits.get(0).getClose());
            result.put("volume", stockUnits.get(0).getVolume());
            result.put("change", stockUnits.get(0).getClose() - stockUnits.get(0).getOpen());

            return result;

        } catch (AlphaVantageException e) {
            log.error("Failed to fetch stock price for {}: {}", symbol, e.getMessage());
            throw new RuntimeException("Failed to fetch stock data", e);
        }
    }

    /**
     * Get company overview information
     * @param symbol Stock symbol code
     * @return Company information
     */
    public Map<String, Object> getCompanyOverview(String symbol) {
        try {
            var response = AlphaVantage.api()
                    .fundamentalData()
                    .companyOverview()
                    .forSymbol(symbol)
                    .fetchSync();

            if (response == null) {
                throw new RuntimeException("No data returned for symbol: " + symbol);
            }

            return getStringObjectMap(symbol, response);

        } catch (AlphaVantageException e) {
            log.error("Failed to fetch company overview for {}: {}", symbol, e.getMessage());
            throw new RuntimeException("Failed to fetch company data", e);
        }
    }

    /**
     * Convert company overview response to map format
     * @param symbol Stock symbol code
     * @param response Company overview response
     * @return Formatted company data map
     */
    public static Map<String, Object> getStringObjectMap(String symbol, CompanyOverviewResponse response) {
        Map<String, Object> result = new HashMap<>();
        result.put("Symbol", symbol);
        result.put("Name", response.getOverview().getName());
        result.put("Description", response.getOverview().getDescription());
        result.put("Exchange", response.getOverview().getExchange());
        result.put("Industry", response.getOverview().getIndustry());
        result.put("PERatio", response.getOverview().getPERatio());
        result.put("MarketCap", response.getOverview().getMarketCapitalization());
        return result;
    }

    /**
     * Get detailed historical stock data
     * @param symbol Stock symbol code
     * @param days Number of days of historical data to retrieve
     * @return List of historical stock data
     */
    public List<Map<String, Object>> getStockHistory(String symbol, int days) {
        try {
            TimeSeriesResponse response = AlphaVantage.api()
                    .timeSeries()
                    .daily()
                    .forSymbol(symbol)
                    .outputSize(OutputSize.FULL)
                    .fetchSync();

            return response.getStockUnits()
                    .stream()
                    .limit(days)
                    .map(unit -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("date", unit.getDate());
                        data.put("open", unit.getOpen());
                        data.put("high", unit.getHigh());
                        data.put("low", unit.getLow());
                        data.put("close", unit.getClose());
                        data.put("volume", unit.getVolume());
                        return data;
                    })
                    .collect(Collectors.toList());

        } catch (AlphaVantageException e) {
            log.error("Failed to fetch stock history for {}: {}", symbol, e.getMessage());
            throw new RuntimeException("Failed to fetch stock history", e);
        }
    }
}