import React, { useState, useEffect } from 'react';
import {
    Box, Button, Card, CardContent, CardHeader, Checkbox, Collapse, FormControlLabel,
    Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography, useTheme, Fade, Pagination, CircularProgress, Select, MenuItem,
    FormHelperText, InputAdornment, Tooltip, Zoom, Paper, Chip
} from '@mui/material';
import {
    Search as SearchIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon, Close as CloseIcon, ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon, FilterList as FilterListIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getAllRecordsAPI, getRecordsByTypeAPI, createRecordAPI, updateRecordAPI, deleteRecordAPI, deleteRecordsInBatchAPI
} from '@/api/record';
import { searchAPI } from '@/api/search';

const MotionCard = motion(Card);
const MotionTableRow = motion.tr;

export default function Transaction() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [transactionForm, setTransactionForm] = useState({
        type: 'Expense',
        category: '',
        amount: '',
        transactionMethod: '',
        transactionTime: '',
        transactionDescription: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [successMessage, setSuccessMessage] = useState('');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        fetchTransactions();
    }, [filterType]);

    const fetchTransactions = async (updateType = 'all') => {
        try {
            setLoading(true);
            let response;
            if (updateType === 'all' || filterType === 'All') {
                response = await getAllRecordsAPI();
            } else {
                response = await getRecordsByTypeAPI(filterType);
            }
            const allTransactions = response.data;
            setTotalPages(Math.ceil(allTransactions.length / 10));
            setTransactions(allTransactions);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch transactions');
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await searchAPI(searchTerm);
            const searchResults = response.data.content;
            setTransactions(searchResults);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            setError('Failed to search transactions');
            setLoading(false);
        }
    };

    const handleAction = (action) => {
        setSuccessMessage(`Transaction ${action.toLowerCase()} successful`);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            fetchTransactions();
        }, 2000);
    };

    const handleSelectTransaction = (id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        setSelectedTransactions(checked ? transactions.map(t => t.id) : []);
    };

    const handleBatchDelete = async () => {
        try {
            await deleteRecordsInBatchAPI(selectedTransactions);
            setTransactions(prevTransactions =>
                prevTransactions.filter(t => !selectedTransactions.includes(t.id))
            );
            handleAction('Batch Delete');
            setSelectedTransactions([]);
            fetchTransactions();
        } catch (error) {
            setError('Failed to delete selected transactions');
        }
    };

    const formatDateTimeForBackend = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toISOString();
    };

    const validateForm = () => {
        const errors = {};
        if (!transactionForm.type) errors.type = 'Type is required';
        if (!transactionForm.category) errors.category = 'Category is required';
        if (!transactionForm.amount) errors.amount = 'Amount is required';
        if (!transactionForm.transactionMethod) errors.transactionMethod = 'Transaction method is required';
        if (!transactionForm.transactionTime) errors.transactionTime = 'Transaction time is required';
        if (!transactionForm.transactionDescription) errors.transactionDescription = 'Description is required';

        const currentDate = new Date();
        const selectedDate = new Date(transactionForm.transactionTime);
        if (selectedDate > currentDate) {
            errors.transactionTime = 'Cannot select a future date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddTransaction = async () => {
        if (validateForm()) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                };
                const response = await createRecordAPI(formattedTransaction);
                setTransactions(prevTransactions => [...prevTransactions, response.data]);
                handleAction('Add');
                setShowAddForm(false);
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: '',
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                });
                fetchTransactions(formattedTransaction.type);
            } catch (error) {
                setError('Failed to add transaction');
            }
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction.id);
        setTransactionForm({
            ...transaction,
            transactionTime: transaction.transactionTime.slice(0, 16)
        });
        setShowAddForm(true);
    };

    const handleUpdateTransaction = async () => {
        if (validateForm()) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                };
                const response = await updateRecordAPI(editingTransaction, formattedTransaction);
                setTransactions(prevTransactions =>
                    prevTransactions.map(t => t.id === editingTransaction ? response.data : t)
                );
                handleAction('Edit');
                setShowAddForm(false);
                setEditingTransaction(null);
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: '',
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                });
                fetchTransactions(formattedTransaction.type);
            } catch (error) {
                setError('Failed to update transaction');
            }
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id);
            setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
            handleAction('Delete');
            fetchTransactions();
        } catch (error) {
            setError('Failed to delete transaction');
        }
    };

    const paginatedTransactions = transactions.slice((page - 1) * 10, page * 10);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
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
                    <Typography variant="body1">{successMessage}</Typography>
                    <IconButton size="small" onClick={() => setShowSuccess(false)} sx={{ ml: 2, color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Fade>
            <MotionCard
                sx={{ maxWidth: 'xl', mx: 'auto', overflow: 'hidden', borderRadius: 4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <CardHeader
                    title={<Typography variant="h4">Transaction Records</Typography>}
                    sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}
                />
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Search Transactions"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            size="medium"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleSearch}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                            >
                                {showAddForm ? 'Hide Form' : 'Add Transaction'}
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FilterListIcon />
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Income">Income</MenuItem>
                                    <MenuItem value="Expense">Expense</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    </Box>

                    <Collapse in={showAddForm}>
                        <Box sx={{ px: 3, pb: 3 }}>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
                                            error={!!formErrors.type}
                                        >
                                            <MenuItem value="Income">Income</MenuItem>
                                            <MenuItem value="Expense">Expense</MenuItem>
                                        </Select>
                                        {formErrors.type && <FormHelperText error>{formErrors.type}</FormHelperText>}
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Category"
                                            variant="outlined"
                                            value={transactionForm.category}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                                            fullWidth
                                            required
                                            error={!!formErrors.category}
                                            helperText={formErrors.category}
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
                                            required
                                            error={!!formErrors.amount}
                                            helperText={formErrors.amount}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Transaction Method"
                                            variant="outlined"
                                            value={transactionForm.transactionMethod}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, transactionMethod: e.target.value })}
                                            fullWidth
                                            required
                                            error={!!formErrors.transactionMethod}
                                            helperText={formErrors.transactionMethod}
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
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{ max: new Date().toISOString().slice(0, 16) }}
                                            error={!!formErrors.transactionTime}
                                            helperText={formErrors.transactionTime}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Transaction Description"
                                            variant="outlined"
                                            value={transactionForm.transactionDescription}
                                            onChange={(e) => setTransactionForm({ ...transactionForm, transactionDescription: e.target.value })}
                                            fullWidth
                                            required
                                            error={!!formErrors.transactionDescription}
                                            helperText={formErrors.transactionDescription}
                                            multiline
                                            rows={2}
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
                            </Paper>
                        </Box>
                    </Collapse>

                    <TableContainer sx={{ maxHeight: 440, overflowY:  'auto' }}>
                        <Table stickyHeader>
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
                                        <MotionTableRow
                                            key={transaction.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedTransactions.includes(transaction.id)}
                                                    onChange={() => handleSelectTransaction(transaction.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={transaction.type === 'Income' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                                                    label={transaction.type}
                                                    color={transaction.type === 'Income' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{transaction.category}</TableCell>
                                            <TableCell sx={{ color: transaction.type === 'Expense' ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                                                ${Number(transaction.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{transaction.transactionMethod}</TableCell>
                                            <TableCell>{new Date(transaction.transactionTime).toLocaleString()}</TableCell>
                                            <TableCell>{transaction.transactionDescription}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit" arrow>
                                                    <IconButton onClick={() => handleEditTransaction(transaction)} color="primary">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <IconButton onClick={() => handleDeleteTransaction(transaction.id)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </MotionTableRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Zoom in={selectedTransactions.length > 0}>
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
                        </Zoom>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </CardContent>
            </MotionCard>
        </Box>
    );
}