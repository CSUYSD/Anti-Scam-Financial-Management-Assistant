'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCcw, Search, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { searchStocks, getCurrencyExchangeRate, getMarketStatus } from '@/services/StockMarketService'

export default function StockMarketDashboard() {
    const [marketStatus, setMarketStatus] = useState([])
    const [exchangeRates, setExchangeRates] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const [status, rates] = await Promise.all([
                getMarketStatus(),
                Promise.all([
                    getCurrencyExchangeRate('USD', 'EUR'),
                    getCurrencyExchangeRate('USD', 'JPY'),
                    getCurrencyExchangeRate('USD', 'GBP')
                ])
            ])
            setMarketStatus(status)
            setExchangeRates(rates)
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast({
                title: "Error",
                description: "Failed to fetch market data. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchTerm.trim()) return
        setLoading(true)
        try {
            const results = await searchStocks(searchTerm)
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching stocks:', error)
            toast({
                title: "Error",
                description: "Failed to search stocks. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        await fetchInitialData()
        toast({
            title: "Success",
            description: "Market data refreshed successfully.",
        })
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
                        <CardContent>
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
                                            <TableCell>{market.region}</TableCell>
                                            <TableCell>{market.marketType}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    market.currentStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {market.currentStatus.charAt(0).toUpperCase() + market.currentStatus.slice(1)}
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
                            <Button onClick={handleRefresh}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh Data
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="exchange-rates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Real-Time Exchange Rates</CardTitle>
                            <CardDescription>Latest currency exchange rates against USD</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Exchange Rate</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exchangeRates.map((rate, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{rate.fromCurrency} ({rate.fromCurrencyName})</TableCell>
                                            <TableCell>{rate.toCurrency} ({rate.toCurrencyName})</TableCell>
                                            <TableCell>{rate.exchangeRate.toFixed(4)}</TableCell>
                                            <TableCell>{new Date(rate.lastUpdated).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleRefresh}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh Rates
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
                        <CardContent>
                            <div className="flex space-x-2 mb-4">
                                <Input
                                    placeholder="Enter stock symbol or name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                            {searchResults.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Region</TableHead>
                                            <TableHead>Currency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchResults.map((stock, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{stock.symbol}</TableCell>
                                                <TableCell>{stock.name}</TableCell>
                                                <TableCell>{stock.type}</TableCell>
                                                <TableCell>{stock.region}</TableCell>
                                                <TableCell>{stock.currency}</TableCell>
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
    )
}