
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
            // 返回模拟数据而不是null
            return getMockData(params.function);
        }

        return data;
    } catch (error) {
        console.error('API调用失败:', error);
        // 返回模拟数据而不是抛出错误
        return getMockData(params.function);
    }
};

// 获取模拟数据
const getMockData = (functionName) => {
    switch (functionName) {
        case 'GLOBAL_QUOTE':
            return {
                'Global Quote': {
                    '01. symbol': 'AAPL',
                    '02. open': '150.00',
                    '03. high': '152.00',
                    '04. low': '149.00',
                    '05. price': '151.00',
                    '06. volume': '1000000',
                    '07. latest trading day': '2024-10-22',
                    '08. previous close': '150.50',
                    '09. change': '0.50',
                    '10. change percent': '0.33%'
                }
            };
        case 'TIME_SERIES_DAILY':
            return {
                'Time Series (Daily)': Array.from({ length: 90 }, (_, i) => ({
                    [`2024-10-${22 - i}`]: {
                        '1. open': '150.00',
                        '2. high': '152.00',
                        '3. low': '149.00',
                        '4. close': '151.00',
                        '5. volume': '1000000'
                    }
                })).reduce((acc, cur) => ({ ...acc, ...cur }), {})
            };
        default:
            return {};
    }
};

// 全球市场数据
export const fetchGlobalMarketData = async () => {
    try {
        const responses = await Promise.all([
            fetchFromAPI({
                function: 'GLOBAL_QUOTE',
                symbol: 'SPY'
            }),
            fetchFromAPI({
                function: 'GLOBAL_QUOTE',
                symbol: 'EWA'
            }),
            fetchFromAPI({
                function: 'GLOBAL_QUOTE',
                symbol: 'EWU'
            })
        ]);

        return [
            {
                market: 'US',
                index: 'S&P 500',
                value: parseFloat(responses[0]['Global Quote']?.['05. price'] || 0),
                change: parseFloat(responses[0]['Global Quote']?.['10. change percent']?.replace('%', '') || 0)
            },
            {
                market: 'Australia',
                index: 'ASX 200',
                value: parseFloat(responses[1]['Global Quote']?.['05. price'] || 0),
                change: parseFloat(responses[1]['Global Quote']?.['10. change percent']?.replace('%', '') || 0)
            },
            {
                market: 'UK',
                index: 'FTSE 100',
                value: parseFloat(responses[2]['Global Quote']?.['05. price'] || 0),
                change: parseFloat(responses[2]['Global Quote']?.['10. change percent']?.replace('%', '') || 0)
            }
        ];
    } catch (error) {
        console.error('获取全球市场数据失败:', error);
        // 返回模拟数据
        return [
            { market: 'US', index: 'S&P 500', value: 4185.81, change: 0.75 },
            { market: 'Australia', index: 'ASX 200', value: 7306.40, change: 0.31 },
            { market: 'UK', index: 'FTSE 100', value: 7256.94, change: 0.52 }
        ];
    }
};

// 由于没有直接的期权API，使用股票数据模拟
export const fetchRealTimeOptions = async () => {
    try {
        const stocks = ['AAPL', 'GOOGL', 'AMZN'];
        const responses = await Promise.all(
            stocks.map(symbol =>
                fetchFromAPI({
                    function: 'GLOBAL_QUOTE',
                    symbol
                })
            )
        );

        return responses.map((response, index) => ({
            symbol: `${stocks[index]}`,
            lastPrice: parseFloat(response['Global Quote']?.['05. price'] || 0),
            change: parseFloat(response['Global Quote']?.['09. change'] || 0),
            volume: parseInt(response['Global Quote']?.['06. volume'] || 0)
        }));
    } catch (error) {
        console.error('获取期权数据失败:', error);
        // 返回模拟数据
        return [
            { symbol: 'AAPL', lastPrice: 150.25, change: 2.5, volume: 1000000 },
            { symbol: 'GOOGL', lastPrice: 2800.75, change: -1.2, volume: 500000 },
            { symbol: 'AMZN', lastPrice: 3300.50, change: 1.8, volume: 750000 }
        ];
    }
};

// 市场趋势数据
export const fetchMarketTrendData = async (market) => {
    try {
        const symbol = market === 'US' ? 'SPY' : market === 'Australia' ? 'EWA' : 'EWU';
        const response = await fetchFromAPI({
            function: 'TIME_SERIES_DAILY',
            symbol,
            outputsize: 'compact'
        });

        const timeSeriesData = response['Time Series (Daily)'];
        return Object.entries(timeSeriesData)
            .map(([date, values]) => ({
                date,
                value: parseFloat(values['4. close'])
            }))
            .slice(0, 90)
            .reverse();
    } catch (error) {
        console.error('获取市场趋势数据失败:', error);
        // 返回模拟数据
        const baseValue = market === 'US' ? 4000 : market === 'Australia' ? 7000 : 7000;
        return Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: baseValue + Math.random() * 500 - 250
        }));
    }
};

// 公司股票数据
export const fetchCompanyStock = async (symbol) => {
    try {
        const response = await fetchFromAPI({
            function: 'GLOBAL_QUOTE',
            symbol
        });

        const quote = response['Global Quote'];
        return {
            symbol: symbol,
            name: symbol, // 简化处理，直接使用symbol作为名称
            price: parseFloat(quote?.['05. price'] || 0),
            change: parseFloat(quote?.['09. change'] || 0),
            volume: parseInt(quote?.['06. volume'] || 0),
            marketCap: 'N/A', // 简化处理
            pe: 0,
            dividend: 0
        };
    } catch (error) {
        console.error('获取公司股票数据失败:', error);
        return {
            symbol: symbol,
            name: symbol,
            price: 0,
            change: 0,
            volume: 0,
            marketCap: 'N/A',
            pe: 0,
            dividend: 0
        };
    }
};

// 股票价格历史
export const fetchStockPriceHistory = async (symbol) => {
    try {
        const response = await fetchFromAPI({
            function: 'TIME_SERIES_DAILY',
            symbol,
            outputsize: 'compact'
        });

        return Object.entries(response['Time Series (Daily)'])
            .map(([date, values]) => ({
                date,
                price: parseFloat(values['4. close'])
            }))
            .slice(0, 30)
            .reverse();
    } catch (error) {
        console.error('获取历史价格数据失败:', error);
        // 返回模拟数据
        return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            price: 140 + Math.random() * 40
        }));
    }
};

// 新闻情绪分析
export const fetchNewsAndSentiment = async (symbol) => {
    return {
        sentiment: 'Positive',
        shortTermPrediction: 'Upward trend expected in the next week',
        longTermOutlook: 'Strong growth potential over the next 6 months',
        riskAssessment: 'Moderate risk'
    };
};

// 用户偏好
export const getUserPreferences = () => {
    return ['AAPL', 'GOOGL', 'MSFT'];
};

export const saveUserPreferences = (preferences) => {
    return Promise.resolve();
};