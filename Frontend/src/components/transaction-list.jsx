'use client'

import React, { useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, Edit, Trash2 } from 'lucide-react'
import { deleteRecordAPI } from '@/api/record'
import { searchAPI, advancedSearchAPI } from '@/api/search'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

const transactionTypes = ['Income', 'Expense']

export default function TransactionList({ transactions, onBatchDelete, onTransactionUpdated, page, totalPages, onPageChange }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [transactionType, setTransactionType] = useState('All')
    const [selectedTransactions, setSelectedTransactions] = useState([])
    const [advancedSearchParams, setAdvancedSearchParams] = useState({
        description: '',
        type: '',
        minAmount: '',
        maxAmount: ''
    })

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            onTransactionUpdated()
            return
        }

        try {
            const response = await searchAPI(searchTerm)
            const searchResults = response.data || []
            // Update the parent component's state
            onTransactionUpdated(searchResults)
        } catch (error) {
            console.error('Search error:', error)
            toast({
                title: "Error",
                description: "Failed to search transactions",
                variant: "destructive",
            })
        }
    }

    const handleAdvancedSearch = async () => {
        try {
            let response
            if (advancedSearchParams.type === "all") {
                const { type, ...restParams } = advancedSearchParams
                response = await advancedSearchAPI(restParams)
            } else {
                response = await advancedSearchAPI(advancedSearchParams)
            }
            const searchResults = response.data || []
            // Update the parent component's state
            onTransactionUpdated(searchResults)
        } catch (error) {
            console.error('Advanced search error:', error)
            toast({
                title: "Error",
                description: "Failed to perform advanced search",
                variant: "destructive",
            })
        }
    }

    const handleSelectTransaction = useCallback((id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        )
    }, [])

    const handleSelectAll = useCallback((checked) => {
        setSelectedTransactions(checked ? transactions.map(t => t.id) : [])
    }, [transactions])

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id)
            toast({
                title: "Action Completed",
                description: "Delete action was successful.",
            })
            onTransactionUpdated()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete transaction",
                variant: "destructive",
            })
        }
    }

    const handleTypeSelect = (type) => {
        setTransactionType(type)
        // You might want to add filtering logic here or in the parent component
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            {transactionType} <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleTypeSelect('All')}>All</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {transactionTypes.map((type) => (
                            <DropdownMenuItem key={type} onClick={() => handleTypeSelect(type)}>
                                {type}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex space-x-2">
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={handleSearch}>Search</Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Advanced Search</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Advanced Search</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={advancedSearchParams.description}
                                        onChange={(e) => setAdvancedSearchParams({ ...advancedSearchParams, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">
                                        Type
                                    </Label>
                                    <Select
                                        value={advancedSearchParams.type}
                                        onValueChange={(value) => setAdvancedSearchParams({ ...advancedSearchParams, type: value })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {transactionTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="minAmount" className="text-right">
                                        Min Amount
                                    </Label>
                                    <Input
                                        id="minAmount"
                                        type="number"
                                        value={advancedSearchParams.minAmount}
                                        onChange={(e) => setAdvancedSearchParams({ ...advancedSearchParams, minAmount: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="maxAmount" className="text-right">
                                        Max Amount
                                    </Label>
                                    <Input
                                        id="maxAmount"
                                        type="number"
                                        value={advancedSearchParams.maxAmount}
                                        onChange={(e) => setAdvancedSearchParams({ ...advancedSearchParams, maxAmount: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAdvancedSearch}>Search</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedTransactions.includes(transaction.id)}
                                        onCheckedChange={() => handleSelectTransaction(transaction.id)}
                                    />
                                </TableCell>
                                <TableCell>{transaction.type}</TableCell>
                                <TableCell>{transaction.category}</TableCell>
                                <TableCell className={transaction.type === 'Expense' ? 'text-red-600' : 'text-green-600'}>
                                    ${Number(transaction.amount).toFixed(2)}
                                </TableCell>
                                <TableCell>{transaction.transactionMethod}</TableCell>
                                <TableCell>{format(parseISO(transaction.transactionTime), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                <TableCell>{transaction.transactionDescription}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => onTransactionUpdated(transaction)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>

                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <div className="flex-1 text-center text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
            <div className="flex justify-between items-center mt-4">
                <Button variant="destructive" onClick={() => onBatchDelete(selectedTransactions)} disabled={selectedTransactions.length === 0}>
                    Delete Selected
                </Button>
            </div>
        </>
    )
}