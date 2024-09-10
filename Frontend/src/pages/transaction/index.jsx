import React, { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Download, Upload, CheckCircle, X } from 'lucide-react'
import { Button, TextField, Checkbox, FormControlLabel } from '@mui/material'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Collapse,
} from '@mui/material'

export default function Transaction() {
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState([])
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [transactionForm, setTransactionForm] = useState({
        income_or_expense: 'Expense',
        transaction_type: '',
        amount: '',
        transaction_method: '',
        transaction_time: '',
        transaction_description: '',
        account_id: 1
    })
    const [transactions, setTransactions] = useState([
        { id: 1, income_or_expense: 'Expense', transaction_type: 'Purchase', amount: 50.00, transaction_method: 'Credit Card', transaction_time: '2024-08-25 10:30:00', transaction_description: 'Grocery Shopping', account_id: 1 },
        { id: 2, income_or_expense: 'Income', transaction_type: 'Salary', amount: 3000.00, transaction_method: 'Bank Transfer', transaction_time: '2024-08-24 09:00:00', transaction_description: 'Monthly Salary', account_id: 1 },
        { id: 3, income_or_expense: 'Expense', transaction_type: 'Transfer', amount: 200.00, transaction_method: 'Online Banking', transaction_time: '2024-08-23 14:15:00', transaction_description: 'Savings Transfer', account_id: 2 },
        { id: 4, income_or_expense: 'Expense', transaction_type: 'Withdrawal', amount: 100.00, transaction_method: 'ATM', transaction_time: '2024-08-22 16:45:00', transaction_description: 'Cash Withdrawal', account_id: 1 },
    ])

    const handleSearch = () => {
        console.log('Searching for:', searchTerm)
    }

    const handleAction = (action) => {
        console.log(action)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    const handleSelectTransaction = (id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        )
    }

    const handleSelectAll = (checked) => {
        setSelectedTransactions(checked ? transactions.map(t => t.id) : [])
    }

    const handleBatchDelete = () => {
        setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t.id)))
        setSelectedTransactions([])
        handleAction('Batch Delete')
    }

    const handleAddTransaction = () => {
        setTransactions([...transactions, { id: Date.now(), ...transactionForm }])
        setTransactionForm({
            income_or_expense: 'Expense',
            transaction_type: '',
            amount: '',
            transaction_method: '',
            transaction_time: '',
            transaction_description: '',
            account_id: 1
        })
        setShowAddForm(false)
        handleAction('Add')
    }

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction)
        setTransactionForm(transaction)
        setShowAddForm(true)
    }

    const handleUpdateTransaction = () => {
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? transactionForm : t))
        setEditingTransaction(null)
        setTransactionForm({
            income_or_expense: 'Expense',
            transaction_type: '',
            amount: '',
            transaction_method: '',
            transaction_time: '',
            transaction_description: '',
            account_id: 1
        })
        setShowAddForm(false)
        handleAction('Edit')
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-md flex items-center text-lg z-50">
                    <CheckCircle className="mr-2 h-6 w-6" />
                    Transaction successful
                    <button onClick={() => setShowSuccess(false)} className="ml-4">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
            <Card className="w-full max-w-7xl mx-auto">
                <CardHeader title={<Typography variant="h4">Transaction Records</Typography>} />
                <CardContent>
                    <div className="flex mb-8">
                        <TextField
                            label="Search Transactions"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            size="large"
                        />
                        <Button onClick={handleSearch} variant="contained" size="large" className="ml-4">
                            <Search className="h-6 w-6 mr-2" />
                            Search
                        </Button>
                    </div>

                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        variant="contained"
                        size="large"
                        className="mb-6"
                    >
                        <Plus className="h-6 w-6 mr-2" />
                        {showAddForm ? 'Hide Form' : 'Add Transaction'}
                    </Button>

                    <Collapse in={showAddForm}>
                        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <Typography variant="h6" className="mb-4">
                                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextField
                                    label="Transaction Type"
                                    variant="outlined"
                                    value={transactionForm.transaction_type}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Amount"
                                    variant="outlined"
                                    type="number"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Transaction Method"
                                    variant="outlined"
                                    value={transactionForm.transaction_method}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_method: e.target.value })}
                                    fullWidth
                                />
                                <TextField
                                    label="Transaction Time"
                                    variant="outlined"
                                    type="datetime-local"
                                    value={transactionForm.transaction_time}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_time: e.target.value })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="Transaction Description"
                                    variant="outlined"
                                    value={transactionForm.transaction_description}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_description: e.target.value })}
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={transactionForm.income_or_expense === 'Income'}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, income_or_expense: e.target.checked ? 'Income' : 'Expense' })}
                                        />
                                    }
                                    label="Is Income"
                                />
                            </div>
                            <Button
                                onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                                variant="contained"
                                size="large"
                                className="mt-6"
                            >
                                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                            </Button>
                        </div>
                    </Collapse>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedTransactions.length === transactions.length}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                />
                                            }
                                            label="Select All"
                                        />
                                    </TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTransactions.includes(transaction.id)}
                                                onChange={() => handleSelectTransaction(transaction.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {transaction.income_or_expense} - {transaction.transaction_type}
                                        </TableCell>
                                        <TableCell className={transaction.income_or_expense === 'Expense' ? 'text-red-500' : 'text-green-500'}>
                                            ${transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{transaction.transaction_method}</TableCell>
                                        <TableCell>{transaction.transaction_time}</TableCell>
                                        <TableCell>{transaction.transaction_description}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEditTransaction(transaction)} variant="outlined" className="mr-2">
                                                <Edit2 className="h-5 w-5" />
                                            </Button>
                                            <Button onClick={() => setTransactions(prev => prev.filter(t => t.id !== transaction.id))} variant="outlined" color="error">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-8 flex justify-between">
                        <Button onClick={handleBatchDelete} variant="contained" color="error" size="large" disabled={selectedTransactions.length === 0}>
                            <Trash2 className="h-6 w-6 mr-2" />
                            Batch Delete ({selectedTransactions.length})
                        </Button>
                        <Button onClick={() => handleAction('Upload CSV')} variant="contained" size="large">
                            <Upload className="h-6 w-6 mr-2" />
                            Upload CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}