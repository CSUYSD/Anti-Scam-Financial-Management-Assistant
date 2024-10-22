
import React, { useState, useEffect, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import {  ChevronDown, Edit, Trash2, CalendarIcon } from 'lucide-react'
import {
    getAllRecordsAPI,
    createRecordAPI,
    updateRecordAPI,
    deleteRecordAPI,
    deleteRecordsInBatchAPI
} from '@/api/record'
import { searchAPI, advancedSearchAPI } from '@/api/search'
import { GetReportAPI } from "@/api/ai"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const transactionTypes = ['Income', 'Expense']
const expenseCategories = ['Grocery', 'Electronic', 'Devices', 'Rent', 'Bills', 'Tuition Fees']
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Other']
const transactionMethods = ['Credit Card', 'Cash', 'PayPal']

export default function EnhancedTransactionManagement() {
    const [searchTerm, setSearchTerm] = useState('')
    const [transactionType, setTransactionType] = useState('All')
    const [selectedTransactions, setSelectedTransactions] = useState([])
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [transactionForm, setTransactionForm] = useState({
        type: 'Expense',
        category: '',
        amount: 0,
        transactionMethod: '',
        transactionTime: '',
        transactionDescription: ''
    })
    const [formErrors, setFormErrors] = useState({})
    const [allTransactions, setAllTransactions] = useState([])
    const [displayedTransactions, setDisplayedTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [advancedSearchParams, setAdvancedSearchParams] = useState({
        description: '',
        type: '',
        minAmount: '',
        maxAmount: ''
    })
    const [date, setDate] = useState(null)
    const [aiReport, setAiReport] = useState(null)
    const [isReportExpanded, setIsReportExpanded] = useState(false)

    useEffect(() => {
        fetchAllRecords()
        fetchAIReport()
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

    const fetchAIReport = async () => {
        try {
            const response = await GetReportAPI()
            setAiReport(response.data)
        } catch (error) {
            console.error('Fetch AI report error:', error)
            toast({
                title: "Error",
                description: "Failed to fetch AI report",
                variant: "destructive",
            })
        }
    }

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setIsSearchActive(false)
            await fetchAllRecords()
            return
        }

        try {
            setLoading(true)
            const response = await searchAPI(searchTerm)
            const searchResults = response.data || []

            setDisplayedTransactions(searchResults)
            setTotalPages(Math.ceil(searchResults.length / 10))
            setPage(1)
            setIsSearchActive(true)
        } catch (error) {
            console.error('Search error:', error)
            toast({
                title: "Error",
                description: "Failed to search transactions",
                variant: "destructive",
            })
            setDisplayedTransactions([])
        } finally {
            setLoading(false)
        }
    }

    const handleAdvancedSearch = async () => {
        try {
            setLoading(true)
            if (advancedSearchParams.type === "all") {
                const { type, ...restParams } = advancedSearchParams
                const response = await advancedSearchAPI(restParams)
                const searchResults = response.data || []
                setDisplayedTransactions(searchResults)
                setTotalPages(Math.ceil(searchResults.length / 10))
                setPage(1)
                setIsSearchActive(true)
            } else {
                const response = await advancedSearchAPI(advancedSearchParams)
                const searchResults = response.data || []
                setDisplayedTransactions(searchResults)
                setTotalPages(Math.ceil(searchResults.length / 10))
                setPage(1)
                setIsSearchActive(true)
            }
        } catch (error) {
            console.error('Advanced search error:', error)
            toast({
                title: "Error",
                description: "Failed to perform advanced search",
                variant: "destructive",
            })
            setDisplayedTransactions([])
        } finally {
            setLoading(false)
        }
    }

    const handleAction = useCallback((action) => {
        toast({
            title: "Action Completed",
            description: `${action} action was successful.`,
        })
        fetchAllRecords()
    }, [])

    const handleSelectTransaction = useCallback((id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        )
    }, [])

    const handleSelectAll = useCallback((checked) => {
        setSelectedTransactions(checked ? displayedTransactions.map(t => t.id) : [])
    }, [displayedTransactions])

    const handleBatchDelete = async () => {
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
            handleAction('Batch Delete')
            setSelectedTransactions([])
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

    const formatDateTimeForBackend = (dateTimeString) => {
        const date = new Date(dateTimeString)
        return date.toISOString()
    }

    const validateForm = () => {
        const errors = {}
        if (!transactionForm.type) errors.type = 'Type is required'
        if (!transactionForm.category) errors.category = 'Category is required'
        if (!transactionForm.amount) errors.amount = 'Amount is required'
        if (!transactionForm.transactionMethod) errors.transactionMethod = 'Transaction method is required'
        if (!transactionForm.transactionTime) errors.transactionTime = 'Transaction time is required'
        if (!transactionForm.transactionDescription) errors.transactionDescription = 'Description is required'

        const currentDate = new Date()
        if (date && date > currentDate) {
            errors.transactionTime = 'Cannot select a future date'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddTransaction = async () => {
        if (validateForm()) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                }
                await createRecordAPI(formattedTransaction)
                handleAction('Add')
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: 0,
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                })
                setDate(null)
                await fetchAllRecords()
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to add transaction",
                    variant: "destructive",
                })
            }
        }
    }

    const handleEditTransaction = useCallback((transaction) => {
        setEditingTransaction(transaction.id)
        const transactionDate = new Date(transaction.transactionTime)
        setDate(transactionDate)
        setTransactionForm({
            ...transaction,
            transactionTime: transactionDate.toISOString()
        })
    }, [])

    const handleUpdateTransaction = async () => {
        if (validateForm() && editingTransaction !== null) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                }
                await updateRecordAPI(editingTransaction, formattedTransaction)
                handleAction('Edit')
                setEditingTransaction(null)
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: 0,
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                })
                setDate(null)
                await fetchAllRecords()
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to update transaction",
                    variant: "destructive",
                })
            }
        }
    }

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id)
            handleAction('Delete')
            await fetchAllRecords()
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
        setIsSearchActive(false)
    }

    const handlePageChange = async (newPage) => {
        setPage(newPage)
        try {
            setLoading(true)
            const response = await getAllRecordsAPI(newPage - 1, 10)
            const transactions = response.data || []
            setDisplayedTransactions(transactions)
            setTotalPages(Math.ceil(transactions.length / 10))
        } catch (error) {
            console.error('Fetch page error:', error)
            toast({
                title: "Error",
                description: "Failed to fetch page",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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

    const paginatedTransactions = displayedTransactions.slice((page - 1) * 10, page * 10)

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-8">
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
                                            checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
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
                                {paginatedTransactions.map((transaction) => (
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
                                            <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(transaction)}>
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
                        <Button variant="destructive" onClick={handleBatchDelete} disabled={selectedTransactions.length === 0}>
                            Delete Selected
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); editingTransaction ? handleUpdateTransaction() : handleAddTransaction(); }} className="space-y-4">
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
                            {editingTransaction ? 'Update' : 'Add'} Transaction
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Report</CardTitle>
                </CardHeader>
                <CardContent>
                    {aiReport ? (
                        <div>
                            <Button onClick={() => setIsReportExpanded(!isReportExpanded)}>
                                {isReportExpanded ? 'Collapse' : 'Expand'} Report
                            </Button>
                            {isReportExpanded && (
                                <div className="mt-4">
                                    <p>{aiReport}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No AI report available at the moment.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}