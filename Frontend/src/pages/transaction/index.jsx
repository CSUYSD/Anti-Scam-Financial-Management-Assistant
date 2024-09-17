import React, { useState } from 'react'
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Collapse,
    FormControlLabel,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    Fade,
} from '@mui/material'
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Upload as UploadIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const MotionCard = motion(Card)

export default function Transaction() {
    const theme = useTheme()
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
        setEditingTransaction(transaction.id)
        setTransactionForm(transaction)
        setShowAddForm(true)
    }

    const handleUpdateTransaction = () => {
        setTransactions(prev => prev.map(t => t.id === editingTransaction ? transactionForm : t))
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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
            <Fade in={showSuccess}>
                <Box sx={{
                    position: 'fixed',
                    top: theme.spacing(2),
                    right: theme.spacing(2),
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">Transaction successful</Typography>
                    <IconButton size="small" onClick={() => setShowSuccess(false)} sx={{ ml: 2, color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Fade>
            <MotionCard
                sx={{ maxWidth: 'xl', mx: 'auto' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CardHeader title={<Typography variant="h4">Transaction Records</Typography>} />
                <CardContent>
                    <Box sx={{ display: 'flex', mb: 4 }}>
                        <TextField
                            label="Search Transactions"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            size="medium"
                        />
                        <Button onClick={handleSearch} variant="contained" size="large" sx={{ ml: 2 }}>
                            <SearchIcon sx={{ mr: 1 }} />
                            Search
                        </Button>
                    </Box>

                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        variant="contained"
                        size="large"
                        sx={{ mb: 3 }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        {showAddForm ? 'Hide Form' : 'Add Transaction'}
                    </Button>

                    <Collapse in={showAddForm}>
                        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Transaction Type"
                                        variant="outlined"
                                        value={transactionForm.transaction_type}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_type: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Amount"
                                        variant="outlined"
                                        type="number"
                                        value={transactionForm.amount}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Transaction Method"
                                        variant="outlined"
                                        value={transactionForm.transaction_method}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_method: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Transaction Time"
                                        variant="outlined"
                                        type="datetime-local"
                                        value={transactionForm.transaction_time}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_time: e.target.value })}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Transaction Description"
                                        variant="outlined"
                                        value={transactionForm.transaction_description}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transaction_description: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={transactionForm.income_or_expense === 'Income'}
                                                onChange={(e) => setTransactionForm({ ...transactionForm, income_or_expense: e.target.checked ? 'Income' : 'Expense' })}
                                            />
                                        }
                                        label="Is Income"
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                                variant="contained"
                                size="large"
                                sx={{ mt: 3 }}
                            >
                                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                            </Button>
                        </Box>
                    </Collapse>

                    <TableContainer>
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
                                <AnimatePresence>
                                    {transactions.map((transaction) => (
                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTransactions.includes(transaction.id)}
                                                    onChange={() => handleSelectTransaction(transaction.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {transaction.income_or_expense} - {transaction.transaction_type}
                                            </TableCell>
                                            <TableCell sx={{ color: transaction.income_or_expense === 'Expense' ? 'error.main' : 'success.main' }}>
                                                ${Number(transaction.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{transaction.transaction_method}</TableCell>
                                            <TableCell>{transaction.transaction_time}</TableCell>
                                            <TableCell>{transaction.transaction_description}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEditTransaction(transaction)} color="primary">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => setTransactions(prev => prev.filter(t => t.id !== transaction.id))} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleBatchDelete}
                            variant="contained"
                            color="error"
                            size="large"
                            disabled={selectedTransactions.length === 0}
                            startIcon={<DeleteIcon />}
                        >
                            Batch Delete ({selectedTransactions.length})
                        </Button>
                        <Button
                            onClick={() => handleAction('Upload CSV')}
                            variant="contained"
                            size="large"
                            startIcon={<UploadIcon />}
                        >
                            Upload CSV
                        </Button>
                    </Box>
                </CardContent>
            </MotionCard>
        </Box>
    )
}