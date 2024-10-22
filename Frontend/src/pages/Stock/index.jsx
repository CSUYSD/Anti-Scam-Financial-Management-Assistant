'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCcw, ChevronUp, ChevronDown, Search, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
    fetchGlobalMarketData,
    fetchMarketTrendData,
    fetchRealTimeOptions,
    fetchCompanyStock,
    fetchStockPriceHistory,
    fetchNewsAndSentiment,
    getUserPreferences,
    saveUserPreferences
} from '@/services/StockMarketService.js';

const fetchUserPreferences = async () => {
    // In a real app, this would fetch from a user's saved preferences
    return ['AAPL', 'GOOGL', 'MSFT']
}

const simulateAIAnalysis = async (symbol) => {
    // This is a placeholder for AI analysis. In a real app, this would call an AI services
    return {
        sentiment: 'Positive',
        shortTermPrediction: 'Upward trend expected in the next week',
        longTermOutlook: 'Strong growth potential over the next 6 months',
        riskAssessment: 'Moderate risk',
    }
}

export default function StockMarketDashboard() {
    const [globalMarketData, setGlobalMarketData] = useState([])
    const [realTimeOptions, setRealTimeOptions] = useState([])
    const [searchSymbol, setSearchSymbol] = useState('')
    const [stockData, setStockData] = useState(null)
    const [stockPriceHistory, setStockPriceHistory] = useState([])
    const [userPreferences, setUserPreferences] = useState([])
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMarket, setSelectedMarket] = useState(null)
    const [marketTrendData, setMarketTrendData] = useState([])

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [marketData, optionsData, preferences] = await Promise.all([
                    fetchGlobalMarketData(),
                    fetchRealTimeOptions(),
                    getUserPreferences(),
                ]);

                setGlobalMarketData(marketData);
                setRealTimeOptions(optionsData);
                setUserPreferences(preferences);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch market data. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleMarketClick = async (market) => {
        setSelectedMarket(market);
        setLoading(true);
        try {
            const trendData = await fetchMarketTrendData(market);
            setMarketTrendData(trendData);
        } catch (error) {
            console.error('Error fetching market trend data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch market trend data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchSymbol) return;

        setLoading(true);
        try {
            const [stockInfo, priceHistory, analysis] = await Promise.all([
                fetchCompanyStock(searchSymbol),
                fetchStockPriceHistory(searchSymbol),
                fetchNewsAndSentiment(searchSymbol),
            ]);

            setStockData(stockInfo);
            setStockPriceHistory(priceHistory);
            setAiAnalysis(analysis);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch stock data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true)
        try {
            const [marketData, optionsData] = await Promise.all([
                fetchGlobalMarketData(),
                fetchRealTimeOptions(),
            ])
            setGlobalMarketData(marketData)
            setRealTimeOptions(optionsData)
            toast({
                title: "Success",
                description: "Market data refreshed successfully.",
            })
        } catch (error) {
            console.error('Error refreshing data:', error)
            toast({
                title: "Error",
                description: "Failed to refresh market data. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 bg-gray-50 dark:bg-gray-900">
            <motion.h1
                className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Stock Market Dashboard
            </motion.h1>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Market Overview</TabsTrigger>
                    <TabsTrigger value="options">Real-Time Options</TabsTrigger>
                    <TabsTrigger value="search">Stock Search</TabsTrigger>
                    <TabsTrigger value="preferences">My Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Market Overview</CardTitle>
                            <CardDescription>Latest updates from major markets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Market</TableHead>
                                            <TableHead>Index</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Change (%)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {globalMarketData.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => handleMarketClick(item.market)}
                                            >
                                                <TableCell>{item.market}</TableCell>
                                                <TableCell>{item.index}</TableCell>
                                                <TableCell>{item.value.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={`flex items-center ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.change >= 0 ? <ChevronUp className="mr-1" /> : <ChevronDown className="mr-1" />}
                                                        {Math.abs(item.change).toFixed(2)}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </motion.div>
                            {selectedMarket && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="mt-8"
                                >
                                    <h3 className="text-xl font-semibold mb-4">{selectedMarket} Market Trend (Last 3 Months)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={marketTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleRefresh}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh Data
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="options">
                    <Card>
                        <CardHeader>
                            <CardTitle>Real-Time Options Data</CardTitle>
                            <CardDescription>Latest options trading information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Last Price</TableHead>
                                            <TableHead>Change</TableHead>
                                            <TableHead>Volume</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {realTimeOptions.map((option, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{option.symbol}</TableCell>
                                                <TableCell>${option.lastPrice.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={`flex items-center ${option.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {option.change >= 0 ? <ChevronUp className="mr-1" /> : <ChevronDown className="mr-1" />}
                                                        ${Math.abs(option.change).toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{option.volume.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </motion.div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Search</CardTitle>
                            <CardDescription>Search for a specific stock and view AI analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    placeholder="Enter stock symbol (e.g., AAPL)"
                                    value={searchSymbol}
                                    onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                            <AnimatePresence>
                                {stockData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-4"
                                    >

                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                            <h3 className="text-lg font-semibold">{stockData.name} ({stockData.symbol})</h3>
                                            <p className="text-2xl font-bold">${stockData.price.toFixed(2)}</p>
                                            <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {stockData.change >= 0 ? <ChevronUp className="inline mr-1" /> : <ChevronDown className="inline mr-1" />}
                                                {Math.abs(stockData.change).toFixed(2)} ({((stockData.change / stockData.price) * 100).toFixed(2)}%)
                                            </p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold mb-2">Price Trend</h4>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={stockPriceHistory}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                            <h4 className="text-lg font-semibold mb-2">Stock Details</h4>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>Volume</TableCell>
                                                        <TableCell>{stockData.volume.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Market Cap</TableCell>
                                                        <TableCell>{stockData.marketCap}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>P/E Ratio</TableCell>
                                                        <TableCell>{stockData.pe.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell>Dividend Yield</TableCell>
                                                        <TableCell>{stockData.dividend.toFixed(2)}%</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {aiAnalysis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>Sentiment</TableCell>
                                                    <TableCell>{aiAnalysis.sentiment}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Short-term Prediction</TableCell>
                                                    <TableCell>{aiAnalysis.shortTermPrediction}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Long-term Outlook</TableCell>
                                                    <TableCell>{aiAnalysis.longTermOutlook}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>Risk Assessment</TableCell>
                                                    <TableCell>{aiAnalysis.riskAssessment}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Preferences</CardTitle>
                            <CardDescription>Your favorite stocks and recommendations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="text-lg font-semibold mb-2">Favorite Stocks</h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {userPreferences.map((symbol, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchSymbol(symbol)
                                                    handleSearch()
                                                }}
                                            >
                                                <Star className="mr-2 h-4 w-4" />
                                                {symbol}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                                <p>Based on your preferences, you might be interested in:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline">NVDA</Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline">AMZN</Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline">TSLA</Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}