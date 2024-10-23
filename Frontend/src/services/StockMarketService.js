const API_KEY = '9142BAPWKIZULGUE';
const BASE_URL = 'https://www.alphavantage.co/query';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

/**
 * Cache manager for storing API responses
 * Implements a simple in-memory cache with expiration
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Store data in cache with timestamp
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Retrieve data from cache if not expired
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if expired/not found
     */
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }
}

const cache = new CacheManager();

/**
 * Base API call function with error handling and caching
 * @param {Object} params - API parameters
 * @returns {Promise<Object>} API response or mock data
 */
const fetchFromAPI = async (params) => {
    const cacheKey = `${params.function}_${JSON.stringify(params)}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        console.log('Returning cached data for:', params.function);
        return cachedData;
    }

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

        if (data['Note'] || data['Information']) {
            console.warn('API rate limit reached:', data['Note'] || data['Information']);
            return getMockData(params.function);
        }

        cache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return getMockData(params.function);
    }
}

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

/**
 * Currency pairs configuration
 */
const CURRENCY_PAIRS = [
    { from: 'AUD', to: 'CNY', name: 'AUD/CNY', baseRate: 4.7621 },
    { from: 'AUD', to: 'USD', name: 'AUD/USD', baseRate: 0.6532 },
    { from: 'AUD', to: 'GBP', name: 'AUD/GBP', baseRate: 0.5232 },
    { from: 'AUD', to: 'EUR', name: 'AUD/EUR', baseRate: 0.6103 }
];

/**
 * Generate realistic mock data for currency pairs
 * @param {string} fromSymbol - Base currency
 * @param {string} toSymbol - Quote currency
 * @returns {Object} Mock exchange rate data
 */
const getMockExchangeRate = (fromSymbol, toSymbol) => {
    const pair = CURRENCY_PAIRS.find(p => p.from === fromSymbol && p.to === toSymbol);
    const baseRate = pair?.baseRate || 1;
    const variation = 0.002; // 0.2% variation

    const generateRate = () => baseRate * (1 + (Math.random() - 0.5) * variation);
    const today = new Date().toISOString().split('T')[0];

    return {
        pair: `${fromSymbol}/${toSymbol}`,
        date: today,
        open: generateRate(),
        high: generateRate(),
        low: generateRate(),
        close: generateRate(),
        isMocked: true
    };
};

/**
 * Fetch daily exchange rate data for a single currency pair
 * @param {string} fromSymbol - Base currency
 * @param {string} toSymbol - Quote currency
 * @param {string} outputSize - Data size (compact/full)
 * @returns {Promise<Object>} Exchange rate data
 */
export const getFXDaily = async (fromSymbol, toSymbol, outputSize = 'compact') => {
    const cacheKey = `FX_${fromSymbol}_${toSymbol}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await fetchFromAPI({
            function: 'FX_DAILY',
            from_symbol: fromSymbol,
            to_symbol: toSymbol,
            outputsize: outputSize
        });

        if (!response || !response['Time Series FX (Daily)']) {
            throw new Error(`Unable to get ${fromSymbol}/${toSymbol} exchange rate data`);
        }

        const timeSeriesData = response['Time Series FX (Daily)'];
        const latestDate = Object.keys(timeSeriesData)[0];
        const latestData = timeSeriesData[latestDate];

        const result = {
            pair: `${fromSymbol}/${toSymbol}`,
            date: latestDate,
            open: parseFloat(latestData['1. open']),
            high: parseFloat(latestData['2. high']),
            low: parseFloat(latestData['3. low']),
            close: parseFloat(latestData['4. close']),
            isMocked: false
        };

        cache.set(cacheKey, result);
        return result;

    } catch (error) {
        console.error(`Failed to get ${fromSymbol}/${toSymbol} exchange rate:`, error);
        return getMockExchangeRate(fromSymbol, toSymbol);
    }
};

/**
 * Fetch exchange rates for all configured AUD currency pairs
 * @returns {Promise<Array>} Array of exchange rate data
 */
export const getAllAUDExchangeRates = async () => {
    try {
        const ratesPromises = CURRENCY_PAIRS.map(pair =>
            getFXDaily(pair.from, pair.to)
        );

        const rates = await Promise.all(ratesPromises);

        return rates.map((rate, index) => ({
            ...rate,
            name: CURRENCY_PAIRS[index].name,
            fromCurrency: CURRENCY_PAIRS[index].from,
            toCurrency: CURRENCY_PAIRS[index].to
        }));

    } catch (error) {
        console.error('Failed to get AUD exchange rates:', error);
        return CURRENCY_PAIRS.map(pair => getMockExchangeRate(pair.from, pair.to));
    }
};

/**
 * Search for stocks by keyword
 * @param {string} keywords - Search keywords
 * @returns {Promise<Array>} Array of matching stocks
 */
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
        console.error('Stock search failed:', error);
        return [];
    }
};

/**
 * Get detailed company overview data
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object|null>} Company overview data or null if not found
 */
export const getCompanyOverview = async (symbol) => {
    try {
        const response = await fetchFromAPI({
            function: 'OVERVIEW',
            symbol
        });

        if (!response || !response.Symbol) {
            throw new Error(`No data found for symbol: ${symbol}`);
        }

        return {
            symbol: response.Symbol,
            name: response.Name,
            description: response.Description,
            exchange: response.Exchange,
            currency: response.Currency,
            country: response.Country,
            sector: response.Sector,
            industry: response.Industry,
            // Financial metrics
            marketCap: parseFloat(response.MarketCapitalization),
            peRatio: parseFloat(response.PERatio),
            pegRatio: parseFloat(response.PEGRatio),
            bookValue: parseFloat(response.BookValue),
            dividendPerShare: parseFloat(response.DividendPerShare),
            dividendYield: parseFloat(response.DividendYield),
            eps: parseFloat(response.EPS),
            revenuePerShareTTM: parseFloat(response.RevenuePerShareTTM),
            profitMargin: parseFloat(response.ProfitMargin),
            // Growth metrics
            quarterlyEarningsGrowthYOY: parseFloat(response.QuarterlyEarningsGrowthYOY),
            quarterlyRevenueGrowthYOY: parseFloat(response.QuarterlyRevenueGrowthYOY),
            // Analyst targets
            analystTargetPrice: parseFloat(response.AnalystTargetPrice),
            // Additional info
            beta: parseFloat(response.Beta),
            weekHigh52: parseFloat(response['52WeekHigh']),
            weekLow52: parseFloat(response['52WeekLow'])
        };
    } catch (error) {
        console.error('Failed to get company overview:', error);
        return null;
    }
};

/**
 * Combined function to search stocks and get company overviews
 * @param {string} keywords - Search keywords
 * @returns {Promise<Array>} Array of stocks with detailed information
 */
export const searchAndGetOverview = async (keywords) => {
    try {
        const searchResults = await searchStocks(keywords);

        if (!searchResults.length) {
            return [];
        }

        const topMatches = searchResults.slice(0, 5);
        const detailedResults = await Promise.all(
            topMatches.map(async (result) => {
                const overview = await getCompanyOverview(result.symbol);
                return {
                    ...result,
                    overview
                };
            })
        );

        return detailedResults.filter(result => result.overview !== null);
    } catch (error) {
        console.error('Search and overview operation failed:', error);
        return [];
    }
};

/**
 * Get current market status for major global markets
 * @returns {Promise<Array>} Array of market status information
 */
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
        console.error('Failed to get market status:', error);
        return getMockData('MARKET_STATUS').markets;
    }
};