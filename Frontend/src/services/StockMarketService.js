const API_KEY = 'I24S6DX8ZCFSBCI8';
const BASE_URL = 'https://www.alphavantage.co/query';

// 基础API调用函数
const fetchFromAPI = async (params) => {
    try {
        const queryString = new URLSearchParams({
            ...params,
            apikey: API_KEY
        }).toString();

        const response = await fetch(`${BASE_URL}?${queryString}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }
        if (data['Note']) {
            console.warn('API调用频率限制:', data['Note']);
            return getMockData(params.function);
        }

        return data;
    } catch (error) {
        console.error('API调用失败:', error);
        return getMockData(params.function);
    }
};

// 获取模拟数据
const getMockData = (functionName) => {
    const mockData = {
        'SYMBOL_SEARCH': {
            'bestMatches': [
                {
                    '1. symbol': 'AAPL',
                    '2. name': 'Apple Inc',
                    '3. type': 'Equity',
                    '4. region': 'United States',
                    '5. marketOpen': '09:30',
                    '6. marketClose': '16:00',
                    '7. timezone': 'UTC-04',
                    '8. currency': 'USD',
                    '9. matchScore': '1.0000'
                },
                {
                    '1. symbol': 'AAPL.LON',
                    '2. name': 'Apple Inc - London',
                    '3. type': 'Equity',
                    '4. region': 'United Kingdom',
                    '5. marketOpen': '08:00',
                    '6. marketClose': '16:30',
                    '7. timezone': 'UTC+01',
                    '8. currency': 'GBP',
                    '9. matchScore': '0.8000'
                }
            ]
        },
        'CURRENCY_EXCHANGE_RATE': {
            'Realtime Currency Exchange Rate': {
                '1. From_Currency Code': 'USD',
                '2. From_Currency Name': 'United States Dollar',
                '3. To_Currency Code': 'JPY',
                '4. To_Currency Name': 'Japanese Yen',
                '5. Exchange Rate': '148.8550',
                '6. Last Refreshed': '2024-10-23 12:00:00 UTC',
                '7. Time Zone': 'UTC',
                '8. Bid Price': '148.8500',
                '9. Ask Price': '148.8600'
            }
        },
        'MARKET_STATUS': {
            'markets': [
                {
                    'market_type': 'Equity',
                    'region': 'United States',
                    'primary_exchanges': 'NYSE, NASDAQ',
                    'current_status': 'open',
                    'local_open': '09:30',
                    'local_close': '16:00',
                    'notes': 'Regular trading hours'
                },
                {
                    'market_type': 'Equity',
                    'region': 'China',
                    'primary_exchanges': 'SSE, SZSE',
                    'current_status': 'closed',
                    'local_open': '09:30',
                    'local_close': '15:00',
                    'notes': 'Closed for the day'
                },
                {
                    'market_type': 'Equity',
                    'region': 'Japan',
                    'primary_exchanges': 'TSE',
                    'current_status': 'closed',
                    'local_open': '09:00',
                    'local_close': '15:30',
                    'notes': 'Closed for the day'
                },
                {
                    'market_type': 'Equity',
                    'region': 'United Kingdom',
                    'primary_exchanges': 'LSE',
                    'current_status': 'open',
                    'local_open': '08:00',
                    'local_close': '16:30',
                    'notes': 'Regular trading hours'
                }
            ]
        }
    };

    return mockData[functionName] || {};
};

// 搜索股票
export const searchStocks = async (keywords) => {
    try {
        const response = await fetchFromAPI({
            function: 'SYMBOL_SEARCH',
            keywords
        });

        const matches = response.bestMatches || [];
        return matches.map(match => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            marketOpen: match['5. marketOpen'],
            marketClose: match['6. marketClose'],
            timezone: match['7. timezone'],
            currency: match['8. currency'],
            matchScore: parseFloat(match['9. matchScore'])
        }));
    } catch (error) {
        console.error('搜索股票失败:', error);
        return (getMockData('SYMBOL_SEARCH').bestMatches || []).map(match => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            marketOpen: match['5. marketOpen'],
            marketClose: match['6. marketClose'],
            timezone: match['7. timezone'],
            currency: match['8. currency'],
            matchScore: parseFloat(match['9. matchScore'])
        }));
    }
};

// 获取实时汇率
export const getCurrencyExchangeRate = async (fromCurrency, toCurrency) => {
    try {
        const response = await fetchFromAPI({
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: fromCurrency,
            to_currency: toCurrency
        });

        const rateData = response?.['Realtime Currency Exchange Rate'];
        if (!rateData) {
            throw new Error('Invalid response structure');
        }

        return {
            fromCurrency: rateData['1. From_Currency Code'] || fromCurrency,
            fromCurrencyName: rateData['2. From_Currency Name'] || 'Unknown',
            toCurrency: rateData['3. To_Currency Code'] || toCurrency,
            toCurrencyName: rateData['4. To_Currency Name'] || 'Unknown',
            exchangeRate: parseFloat(rateData['5. Exchange Rate']) || 0,
            lastUpdated: rateData['6. Last Refreshed'] || new Date().toISOString(),
            timeZone: rateData['7. Time Zone'] || 'UTC',
            bidPrice: parseFloat(rateData['8. Bid Price']) || 0,
            askPrice: parseFloat(rateData['9. Ask Price']) || 0
        };
    } catch (error) {
        console.error('获取汇率失败:', error);
        const mockData = getMockData('CURRENCY_EXCHANGE_RATE')['Realtime Currency Exchange Rate'] || {};
        return {
            fromCurrency: fromCurrency,
            fromCurrencyName: mockData['2. From_Currency Name'] || 'Unknown',
            toCurrency: toCurrency,
            toCurrencyName: mockData['4. To_Currency Name'] || 'Unknown',
            exchangeRate: parseFloat(mockData['5. Exchange Rate'] || 1),
            lastUpdated: mockData['6. Last Refreshed'] || new Date().toISOString(),
            timeZone: mockData['7. Time Zone'] || 'UTC',
            bidPrice: parseFloat(mockData['8. Bid Price'] || 1),
            askPrice: parseFloat(mockData['9. Ask Price'] || 1)
        };
    }
};

// 获取市场状态
export const getMarketStatus = async () => {
    try {
        const response = await fetchFromAPI({
            function: 'MARKET_STATUS'
        });

        const markets = response.markets || getMockData('MARKET_STATUS').markets;
        return markets.map(market => ({
            marketType: market.market_type,
            region: market.region,
            primaryExchanges: market.primary_exchanges,
            currentStatus: market.current_status,
            localOpen: market.local_open,
            localClose: market.local_close,
            notes: market.notes
        }));
    } catch (error) {
        console.error('获取市场状态失败:', error);
        return getMockData('MARKET_STATUS').markets.map(market => ({
            marketType: market.market_type,
            region: market.region,
            primaryExchanges: market.primary_exchanges,
            currentStatus: market.current_status,
            localOpen: market.local_open,
            localClose: market.local_close,
            notes: market.notes
        }));
    }
};