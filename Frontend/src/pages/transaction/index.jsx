'use client'

import React, { useState, useEffect } from 'react'
import { getAllRecordsAPI, deleteRecordsInBatchAPI } from '@/api/record'
import { GetReportAPI } from "@/api/ai"
import { toast } from "@/hooks/use-toast"
import TransactionList from '@/components/transaction-list'
import TransactionForm from '@/components/transaction-form'
import AIReports from '@/components/ai-reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnhancedTransactionManagement() {
    const [allTransactions, setAllTransactions] = useState([])
    const [displayedTransactions, setDisplayedTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [aiReports, setAiReports] = useState([])

    useEffect(() => {
        fetchAllRecords()
        fetchAIReports()
    }, [])

    const fetchAllRecords = async () => {
        try {
            setLoading(true)
            const response = await getAllRecordsAPI(0, 10)
            const transactions = response.data || []
            setAllTransactions(transactions)
            setDisplayedTransactions(transactions)
            setTotalPages(Math.ceil(transactions.length / 10))
            setPage(1)
        } catch (error) {
            console.error('Fetch all records error:', error)
            toast({
                title: "Error",
                description: "Failed to fetch all records",
                variant: "destructive",
            })
            setAllTransactions([])
            setDisplayedTransactions([])
        } finally {
            setLoading(false)
        }
    }

    const fetchAIReports = async () => {
        try {
            const response = await GetReportAPI()
            setAiReports(response.data)
        } catch (error) {
            console.error('Fetch AI reports error:', error)
            toast({
                title: "Error",
                description: "Failed to fetch AI reports",
                variant: "destructive",
            })
        }
    }

    const handleBatchDelete = async (selectedTransactions) => {
        if (selectedTransactions.length === 0) {
            toast({
                title: "Error",
                description: "No transactions selected for deletion",
                variant: "destructive",
            })
            return
        }

        try {
            setLoading(true)
            await deleteRecordsInBatchAPI(selectedTransactions)
            toast({
                title: "Action Completed",
                description: "Batch Delete action was successful.",
            })
            await fetchAllRecords()
        } catch (error) {
            console.error('Batch delete error:', error)
            toast({
                title: "Error",
                description: "Failed to delete selected transactions",
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

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Transaction Management</CardTitle>
                    <CardDescription>Manage your transactions efficiently</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionList
                        transactions={displayedTransactions}
                        onBatchDelete={handleBatchDelete}
                        onTransactionUpdated={fetchAllRecords}
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            <TransactionForm onTransactionAdded={fetchAllRecords} />

            <AIReports reports={aiReports} />
        </div>
    )
}