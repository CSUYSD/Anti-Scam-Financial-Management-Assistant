import React, { useState, useEffect } from 'react';
import { RefreshCcw, Search, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { searchAndGetOverview, getAllAUDExchangeRates, getMarketStatus } from '@/services/StockMarketService';

export default function StockMarketDashboard() {
    const [marketStatus, setMarketStatus] = useState([]);
    const [exchangeRates, setExchangeRates] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({
        initial: true,
        refresh: false,
        search: false
    });
    const [error, setError] = useState({
        market: null,
        rates: null,
        search: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(prev => ({ ...prev, initial: true }));
        setError({ market: null, rates: null, search: null });

        try {
            const [status, rates] = await Promise.all([
                getMarketStatus(),
                getAllAUDExchangeRates()
            ]);

            setMarketStatus(status);

            // 检查汇率数据中的错误
            const hasErrors = rates.some(rate => rate.error);
            if (hasErrors) {
                setError(prev => ({
                    ...prev,
                    rates: 'Some exchange rates could not be fetched. Showing available data.'
                }));
            }
            setExchangeRates(rates);

        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch market data. Please try again later.",
                variant: "destructive",
            });
            setError({
                market: 'Failed to fetch market status',
                rates: 'Failed to fetch exchange rates',
                search: null
            });
        } finally {
            setLoading(prev => ({ ...prev, initial: false }));
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setLoading(prev => ({ ...prev, search: true }));
        setError(prev => ({ ...prev, search: null }));

        try {
            const results = await searchAndGetOverview(searchTerm);
            if (results.length === 0) {
                setError(prev => ({ ...prev, search: 'No results found' }));
            }
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching stocks:', error);
            setError(prev => ({ ...prev, search: 'Failed to search stocks' }));
            toast({
                title: "Error",
                description: "Failed to search stocks. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(prev => ({ ...prev, search: false }));
        }
    };

    const handleRefresh = async () => {
        setLoading(prev => ({ ...prev, refresh: true }));
        await fetchInitialData();
        setLoading(prev => ({ ...prev, refresh: false }));
        toast({
            title: "Success",
            description: "Market data refreshed successfully.",
        });
    };

    const formatNumber = (value, decimals = 4) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        return typeof value === 'number' ? value.toFixed(decimals) : 'N/A';
    };

    const formatMarketCap = (value) => {
        if (!value) return 'N/A';
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return `$${value.toFixed(2)}`;
    };

    if (loading.initial) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8 bg-gray-50 dark:bg-gray-900">
            <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-100">
                Stock Market Dashboard
            </h1>

            <Tabs defaultValue="market-status" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="market-status">Market Status</TabsTrigger>
                    <TabsTrigger value="exchange-rates">Exchange Rates</TabsTrigger>
                    <TabsTrigger value="stock-search">Stock Search</TabsTrigger>
                </TabsList>

                <TabsContent value="market-status">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Market Status</CardTitle>
                            <CardDescription>Current status of major markets worldwide</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error.market && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error.market}</AlertDescription>
                                </Alert>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Region</TableHead>
                                        <TableHead>Market Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Trading Hours (Local)</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {marketStatus.map((market, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{market.region}</TableCell>
                                            <TableCell>{market.marketType}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    market.currentStatus === 'open'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {market.currentStatus.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell>{market.localOpen} - {market.localClose}</TableCell>
                                            <TableCell>{market.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleRefresh}
                                disabled={loading.refresh}
                            >
                                <RefreshCcw className={`mr-2 h-4 w-4 ${loading.refresh ? 'animate-spin' : ''}`} />
                                {loading.refresh ? 'Refreshing...' : 'Refresh Data'}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="exchange-rates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Real-Time Exchange Rates</CardTitle>
                            <CardDescription>Latest AUD exchange rates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error.rates && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error.rates}</AlertDescription>
                                </Alert>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Currency Pair</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Open</TableHead>
                                        <TableHead>High</TableHead>
                                        <TableHead>Low</TableHead>
                                        <TableHead>Close</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exchangeRates.map((rate, index) => (
                                        <TableRow key={index} className={rate.error ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                            <TableCell className="font-medium">{rate.name}</TableCell>
                                            <TableCell>{rate.date}</TableCell>
                                            <TableCell>{formatNumber(rate.open)}</TableCell>
                                            <TableCell>{formatNumber(rate.high)}</TableCell>
                                            <TableCell>{formatNumber(rate.low)}</TableCell>
                                            <TableCell>{formatNumber(rate.close)}</TableCell>
                                            <TableCell>
                                                {rate.error ? (
                                                    <span className="text-red-500 dark:text-red-400">Error</span>
                                                ) : (
                                                    <span className="text-green-500 dark:text-green-400">OK</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleRefresh}
                                disabled={loading.refresh}
                            >
                                <RefreshCcw className={`mr-2 h-4 w-4 ${loading.refresh ? 'animate-spin' : ''}`} />
                                {loading.refresh ? 'Refreshing...' : 'Refresh Rates'}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="stock-search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Search</CardTitle>
                            <CardDescription>Search for stocks by symbol or name</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Enter stock symbol or name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={loading.search || !searchTerm.trim()}
                                >
                                    {loading.search ? (
                                        <>
                                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Search
                                        </>
                                    )}
                                </Button>
                            </div>

                            {error.search && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error.search}</AlertDescription>
                                </Alert>
                            )}

                            {searchResults.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Region</TableHead>
                                            <TableHead>Currency</TableHead>
                                            <TableHead>Market Cap</TableHead>
                                            <TableHead>P/E Ratio</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchResults.map((stock, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{stock.symbol}</TableCell>
                                                <TableCell>{stock.name}</TableCell>
                                                <TableCell>{stock.type}</TableCell>
                                                <TableCell>{stock.region}</TableCell>
                                                <TableCell>{stock.currency}</TableCell>
                                                <TableCell>{formatMarketCap(stock.overview?.marketCap)}</TableCell>
                                                <TableCell>{formatNumber(stock.overview?.peRatio, 2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}