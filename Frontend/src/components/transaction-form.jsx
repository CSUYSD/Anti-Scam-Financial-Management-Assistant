'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { createRecordAPI, updateRecordAPI } from '@/api/record'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const transactionTypes = ['Income', 'Expense']
const expenseCategories = ['Grocery', 'Electronic', 'Devices', 'Rent', 'Bills', 'Tuition Fees']
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Other']
const transactionMethods = ['Credit Card', 'Cash', 'PayPal']

export default function TransactionForm({ onTransactionAdded, editingTransaction = null }) {
    const [transactionForm, setTransactionForm] = useState(
        editingTransaction || {
            type: 'Expense',
            category: '',
            amount: 0,
            transactionMethod: '',
            transactionTime: '',
            transactionDescription: ''
        }
    )
    const [formErrors, setFormErrors] = useState({})
    const [date, setDate] = useState(editingTransaction ? new Date(editingTransaction.transactionTime) : null)

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm()) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                }
                if (editingTransaction) {
                    await updateRecordAPI(editingTransaction.id, formattedTransaction)
                    toast({
                        title: "Success",
                        description: "Transaction updated successfully",
                    })
                } else {
                    await createRecordAPI(formattedTransaction)
                    toast({
                        title: "Success",
                        description: "Transaction added successfully",
                    })
                }
                onTransactionAdded()
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: 0,
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                })
                setDate(null)
            } catch (error) {
                toast({
                    title: "Error",
                    description: editingTransaction ? "Failed to update transaction" : "Failed to add transaction",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</CardTitle>
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
                        {editingTransaction ? 'Update' : 'Add'} Transaction
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}