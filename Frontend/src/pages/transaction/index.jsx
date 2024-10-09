import React, { useState, useEffect } from 'react'
import {
    Box, Button, Card, CardContent, CardHeader, Checkbox, Collapse, FormControlLabel,
    Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography, useTheme, Fade, Pagination, CircularProgress, Select, MenuItem
} from '@mui/material'
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Upload as UploadIcon, CheckCircle as CheckCircleIcon, Close as CloseIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import {
    getAllRecordsAPI, getRecordsByTypeAPI, createRecordAPI, updateRecordAPI, deleteRecordAPI, deleteRecordsInBatchAPI
} from '@/api/record.jsx'

const MotionCard = motion(Card)

export default function Transaction() {
    const theme = useTheme()
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState([])
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [transactionForm, setTransactionForm] = useState({
        type: 'Expense',
        category: '',
        amount: '',
        transactionMethod: '',
        transactionTime: '',
        transactionDescription: ''
    })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchTransactions()
    }, [page])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const response = await getAllRecordsAPI()
            const allTransactions = response.data
            setTotalPages(Math.ceil(allTransactions.length / 10))
            setTransactions(allTransactions)
            setLoading(false)
        } catch (error) {
            setError('Failed to fetch transactions')
            setLoading(false)
        }
    }

    const handleSearch = () => {
        const filteredTransactions = transactions.filter(transaction =>
            transaction.transactionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setTransactions(filteredTransactions)
    }

    const handleAction = (action) => {
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            fetchTransactions() // Refresh the transactions after showing success message
        }, 1000)
    }

    const handleSelectTransaction = (id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        )
    }

    const handleSelectAll = (checked) => {
        setSelectedTransactions(checked ? transactions.map(t => t.id) : [])
    }

    const handleBatchDelete = async () => {
        try {
            await deleteRecordsInBatchAPI(selectedTransactions)
            handleAction('Batch Delete')
        } catch (error) {
            setError('Failed to delete selected transactions')
        }
    }

    const formatDateTimeForBackend = (dateTimeString) => {
        const date = new Date(dateTimeString)
        return date.toISOString()
    }

    const handleAddTransaction = async () => {
        try {
            const formattedTransaction = {
                ...transactionForm,
                amount: parseFloat(transactionForm.amount),
                transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
            }
            await createRecordAPI(formattedTransaction)
            handleAction('Add')
        } catch (error) {
            setError('Failed to add transaction')
        }
    }

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction.id)
        setTransactionForm({
            ...transaction,
            transactionTime: transaction.transactionTime.slice(0, 16) // Format for datetime-local input
        })
        setShowAddForm(true)
    }

    const handleUpdateTransaction = async () => {
        try {
            const formattedTransaction = {
                ...transactionForm,
                amount: parseFloat(transactionForm.amount),
                transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
            }
            await updateRecordAPI(editingTransaction, formattedTransaction)
            handleAction('Edit')
        } catch (error) {
            setError('Failed to update transaction')
        }
    }

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id)
            handleAction('Delete')
        } catch (error) {
            setError('Failed to delete transaction')
        }
    }

    const paginatedTransactions = transactions.slice((page - 1) * 10, page * 10)

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        )
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
                                    <Select
                                        label="Type"
                                        value={transactionForm.type}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                                        fullWidth
                                    >
                                        <MenuItem value="Income">Income</MenuItem>
                                        <MenuItem value="Expense">Expense</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Category"
                                        variant="outlined"
                                        value={transactionForm.category}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
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
                                        value={transactionForm.transactionMethod}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transactionMethod: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Transaction Time"
                                        variant="outlined"
                                        type="datetime-local"
                                        value={transactionForm.transactionTime}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transactionTime: e.target.value })}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Transaction Description"
                                        variant="outlined"
                                        value={transactionForm.transactionDescription}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, transactionDescription: e.target.value })}
                                        fullWidth
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
                                                    checked={selectedTransactions.length === paginatedTransactions.length}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                />
                                            }
                                            label="Select All"
                                        />
                                    </TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {paginatedTransactions.map((transaction) => (
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
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell>{transaction.category}</TableCell>
                                            <TableCell sx={{ color: transaction.type === 'Expense' ? 'error.main' : 'success.main' }}>
                                                ${Number(transaction.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{transaction.transactionMethod}</TableCell>
                                            <TableCell>{new Date(transaction.transactionTime).toLocaleString()}</TableCell>
                                            <TableCell>{transaction.transactionDescription}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEditTransaction(transaction)} color="primary">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteTransaction(transaction.id)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            color="primary"
                        />
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