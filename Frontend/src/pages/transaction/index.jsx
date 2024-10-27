'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { CalendarIcon, ChevronDown, Edit, Trash2 } from 'lucide-react'
import { getAllRecordsAPI, deleteRecordsInBatchAPI, createRecordAPI, updateRecordAPI, deleteRecordAPI } from '@/api/record'
import { searchAPI, advancedSearchAPI } from '@/api/search'
import { GetReportAPI } from "@/api/ai"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import AIReports from '@/components/ai-reports'
import { cn } from "@/lib/utils"

const transactionTypes = ['Income', 'Expense']
const expenseCategories = ['Grocery', 'Devices', 'Rent', 'Bills', 'Investment', 'Tuition Fees']
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Other']
const transactionMethods = ['Credit Card', 'Debit Card', 'Cash', 'PayPal']

export default function EnhancedTransactionManagement() {
    const [allTransactions, setAllTransactions] = useState([])
    const [displayedTransactions, setDisplayedTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [aiReports, setAiReports] = useState([])
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [transactionType, setTransactionType] = useState('All')
    const [selectedTransactions, setSelectedTransactions] = useState([])
    const [advancedSearchParams, setAdvancedSearchParams] = useState({
        description: '',
        type: '',
        minAmount: '',
        maxAmount: ''
    })
    const [transactionForm, setTransactionForm] = useState({
        type: 'Expense',
        category: '',
        amount: 0,
        transactionMethod: '',
        transactionTime: '',
        transactionDescription: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [date, setDate] = useState(null)

    useEffect(() => {
        fetchAllRecords()
        fetchAIReports()
    }, [])

    useEffect(() => {
        if (editingTransaction) {
            setTransactionForm({
                ...editingTransaction,
                amount: Number(editingTransaction.amount)
            })
            const parsedDate = parseISO(editingTransaction.transactionTime)
            setDate(isValid(parsedDate) ? parsedDate : null)
        } else {
            resetForm()
        }
    }, [editingTransaction])

    const resetForm = () => {
        setTransactionForm({
            type: 'Expense',
            category: '',
            amount: 0,
            transactionMethod: '',
            transactionTime: '',
            transactionDescription: ''
        })
        setDate(null)
        setFormErrors({})
    }

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

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchAllRecords()
            return
        }

        try {
            const response = await searchAPI(searchTerm)
            const searchResults = response.data || []
            setDisplayedTransactions(searchResults)
            setIsSearchActive(true)
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
            setDisplayedTransactions(searchResults)
            setIsSearchActive(true)
        } catch (error) {
            console.error('Advanced search error:', error)
            toast({
                title: "Error",
                description: "Failed to perform advanced search",
                variant: "destructive",
            })
        }
    }

    const handleTransactionUpdated = useCallback((updatedTransaction) => {
        setAllTransactions(prevTransactions =>
            prevTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
        )
        setDisplayedTransactions(prevTransactions =>
            prevTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
        )
        setEditingTransaction(null)
        setIsUpdateDialogOpen(false)
        resetForm()
        fetchAllRecords() // Refresh the page immediately after update
    }, [])

    const handleTransactionAdded = useCallback((newTransaction) => {
        setAllTransactions(prevTransactions => [newTransaction, ...prevTransactions])
        setDisplayedTransactions(prevTransactions => [newTransaction, ...prevTransactions])
        setIsSearchActive(false)
        resetForm()
        fetchAllRecords() // Refresh the page immediately after adding
    }, [])

    const handleClearSearch = useCallback(() => {
        setIsSearchActive(false)
        setDisplayedTransactions(allTransactions)
        setSearchTerm('')
        setAdvancedSearchParams({
            description: '',
            type: '',
            minAmount: '',
            maxAmount: ''
        })
    }, [allTransactions])

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage)
        // Implement pagination logic here if needed
    }, [])

    const handleSelectTransaction = useCallback((id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        )
    }, [])

    const handleSelectAll = useCallback((checked) => {
        setSelectedTransactions(checked ? displayedTransactions.map(t => t.id) : [])
    }, [displayedTransactions])

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id)
            toast({
                title: "Action Completed",
                description: "Delete action was successful.",
            })
            fetchAllRecords()
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
        if (type === 'All') {
            setDisplayedTransactions(allTransactions)
        } else {
            setDisplayedTransactions(allTransactions.filter(t => t.type === type))
        }
    }

    const formatDateTimeForBackend = (dateTimeString) => {
        const date = new Date(dateTimeString)
        return isValid(date) ? date.toISOString() : null
    }

    const validateForm = () => {
        const errors = {}
        if (!transactionForm.type) errors.type = 'Type is required'
        if (!transactionForm.category) errors.category = 'Category is required'
        if (!transactionForm.amount) errors.amount = 'Amount is required'
        if (!transactionForm.transactionMethod) errors.transactionMethod = 'Transaction method is required'
        if (!date) errors.transactionTime = 'Transaction time is required'
        if (!transactionForm.transactionDescription) errors.transactionDescription = 'Description is required'

        const currentDate = new Date()
        if (date && date > currentDate) {
            errors.transactionTime = 'Cannot select a future date'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm()) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: date ? date.toISOString() : null
                }
                let updatedTransaction
                if (editingTransaction) {
                    updatedTransaction = await updateRecordAPI(editingTransaction.id, formattedTransaction)
                    toast({
                        title: "Success",
                        description: "Transaction updated successfully",
                    })
                    handleTransactionUpdated(updatedTransaction)
                } else {
                    const response = await createRecordAPI(formattedTransaction)
                    updatedTransaction = response.data
                    toast({
                        title: "Success",
                        description: "Transaction added successfully",
                    })
                    handleTransactionAdded(updatedTransaction)
                }
            } catch (error) {
                console.error('Transaction operation error:', error)
                toast({
                    title: "Error",
                    description: editingTransaction ? "Failed to update transaction" : "Failed to add transaction",
                    variant: "destructive",
                })
            }
        }
    }

    const handleCancelUpdate = () => {
        setEditingTransaction(null)
        setIsUpdateDialogOpen(false)
        resetForm()
        toast({
            title: "Update Cancelled",
            description: "Transaction update has been cancelled.",
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = parseISO(dateString)
        return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : 'Invalid Date'
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
                                        <DialogTitle>Advanced  Search</DialogTitle>
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
                                            checked={selectedTransactions.length === displayedTransactions.length && displayedTransactions.length > 0}
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
                                {displayedTransactions.map((transaction) => (
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
                                        <TableCell>{formatDate(transaction.transactionTime)}</TableCell>
                                        <TableCell>{transaction.transactionDescription}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setEditingTransaction(transaction)
                                                setIsUpdateDialogOpen(true)
                                            }}>
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
                            onClick={() => handlePageChange(page - 1)}
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
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <Button variant="destructive" onClick={() => handleBatchDelete(selectedTransactions)} disabled={selectedTransactions.length === 0}>
                            Delete Selected
                        </Button>
                        {isSearchActive && (
                            <Button onClick={handleClearSearch}>Clear Search Results</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={transactionForm.type}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value, category: '' })}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={transactionForm.category}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(transactionForm.type === 'Expense' ? expenseCategories : incomeCategories).map((category) => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                            </div>
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                                />
                                {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
                            </div>
                            <div>
                                <Label htmlFor="method">Method</Label>
                                <Select
                                    value={transactionForm.transactionMethod}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, transactionMethod: value })}
                                >
                                    <SelectTrigger id="method">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionMethods.map((method) => (
                                            <SelectItem key={method} value={method}>{method}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.transactionMethod && <p className="text-red-500 text-sm mt-1">{formErrors.transactionMethod}</p>}
                            </div>
                            <div>
                                <Label htmlFor="time">Time</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(newDate) => {
                                                setDate(newDate)
                                                setTransactionForm({ ...transactionForm, transactionTime: newDate ? newDate.toISOString() : '' })
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {formErrors.transactionTime && <p className="text-red-500 text-sm mt-1">{formErrors.transactionTime}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={transactionForm.transactionDescription}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transactionDescription: e.target.value })}
                                />
                                {formErrors.transactionDescription && <p className="text-red-500 text-sm mt-1">{formErrors.transactionDescription}</p>}
                            </div>
                        </div>
                        <Button type="submit">
                            Add Transaction
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-type">Type</Label>
                                <Select
                                    value={transactionForm.type}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value, category: '' })}
                                >
                                    <SelectTrigger id="edit-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Select
                                    value={transactionForm.category}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
                                >
                                    <SelectTrigger id="edit-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(transactionForm.type === 'Expense' ? expenseCategories : incomeCategories).map((category) => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-amount">Amount</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                                />
                                {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-method">Method</Label>
                                <Select
                                    value={transactionForm.transactionMethod}
                                    onValueChange={(value) => setTransactionForm({ ...transactionForm, transactionMethod: value })}
                                >
                                    <SelectTrigger id="edit-method">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionMethods.map((method) => (
                                            <SelectItem key={method} value={method}>{method}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.transactionMethod && <p className="text-red-500 text-sm mt-1">{formErrors.transactionMethod}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-time">Time</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(newDate) => {
                                                setDate(newDate)
                                                setTransactionForm({ ...transactionForm, transactionTime: newDate ? newDate.toISOString() : '' })
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {formErrors.transactionTime && <p className="text-red-500 text-sm mt-1">{formErrors.transactionTime}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                    id="edit-description"
                                    value={transactionForm.transactionDescription}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transactionDescription: e.target.value })}
                                />
                                {formErrors.transactionDescription && <p className="text-red-500 text-sm mt-1">{formErrors.transactionDescription}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelUpdate}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update Transaction
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AIReports reports={aiReports} />
        </div>
    )
}