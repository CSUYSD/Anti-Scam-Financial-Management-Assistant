"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Edit, Trash2, Plus, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
    getAllRecordsAPI, getRecordsByTypeAPI, createRecordAPI, updateRecordAPI, deleteRecordAPI, deleteRecordsInBatchAPI
} from '@/api/record';
import { searchAPI } from '@/api/search';

export default function EnhancedTransactionManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [transactionType, setTransactionType] = useState('All');
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [transactionForm, setTransactionForm] = useState({
        type: 'Expense',
        category: '',
        amount: 0,
        transactionMethod: '',
        transactionTime: '',
        transactionDescription: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [allTransactions, setAllTransactions] = useState([]);
    const [displayedTransactions, setDisplayedTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [scrollY, setScrollY] = useState(0);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetchAllRecords();
    }, []);

    const fetchAllRecords = async () => {
        try {
            setLoading(true);
            const response = await getAllRecordsAPI(0, 10); // Fetch first page of records
            const transactions = response.data || [];
            setAllTransactions(transactions);
            setDisplayedTransactions(transactions);
            setTotalPages(Math.ceil(transactions.length / 10));
            setPage(1);
        } catch (error) {
            console.error('Fetch all records error:', error);
            setError('Failed to fetch all records');
            setAllTransactions([]);
            setDisplayedTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setIsSearchActive(false);
            await fetchAllRecords();
            return;
        }

        try {
            setLoading(true);
            const response = await searchAPI(searchTerm);
            const searchResults = response.data || [];

            setDisplayedTransactions(searchResults);
            setTotalPages(Math.ceil(searchResults.length / 10));
            setPage(1);
            setIsSearchActive(true);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search transactions');
            setDisplayedTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = useCallback((action) => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            fetchTransactions();
        }, 3000);
    }, []);

    const handleSelectTransaction = useCallback((id) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = useCallback((checked) => {
        setSelectedTransactions(checked ? displayedTransactions.map(t => t.id) : []);
    }, [displayedTransactions]);

    const handleBatchDelete = async () => {
        if (selectedTransactions.length === 0) {
            setError('No transactions selected for deletion');
            return;
        }

        try {
            setLoading(true);
            await deleteRecordsInBatchAPI(selectedTransactions);
            handleAction('Batch Delete');
            setSelectedTransactions([]);
            await fetchTransactions();
        } catch (error) {
            console.error('Batch delete error:', error);
            setError('Failed to delete selected transactions');
        } finally {
            setLoading(false);
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
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                };
                await createRecordAPI(formattedTransaction);
                handleAction('Add');
                setShowAddForm(false);
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: 0,
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                });
                await fetchTransactions();
            } catch (error) {
                setError('Failed to add transaction');
            }
        }
    };

    const handleEditTransaction = useCallback((transaction) => {
        setEditingTransaction(transaction.id);
        setTransactionForm({
            ...transaction,
            transactionTime: transaction.transactionTime.slice(0, 16)
        });
        setShowAddForm(true);
    }, []);

    const handleUpdateTransaction = async () => {
        if (validateForm() && editingTransaction !== null) {
            try {
                const formattedTransaction = {
                    ...transactionForm,
                    amount: parseFloat(transactionForm.amount.toString()),
                    transactionTime: formatDateTimeForBackend(transactionForm.transactionTime)
                };
                await updateRecordAPI(editingTransaction, formattedTransaction);
                handleAction('Edit');
                setShowAddForm(false);
                setEditingTransaction(null);
                setTransactionForm({
                    type: 'Expense',
                    category: '',
                    amount: 0,
                    transactionMethod: '',
                    transactionTime: '',
                    transactionDescription: ''
                });
                await fetchTransactions();
            } catch (error) {
                setError('Failed to update transaction');
            }
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteRecordAPI(id);
            handleAction('Delete');
            await fetchTransactions();
        } catch (error) {
            setError('Failed to delete transaction');
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await getAllRecordsAPI();
            const transactions = response.data || [];
            setAllTransactions(transactions);
            setDisplayedTransactions(transactions);
            setTotalPages(Math.ceil(transactions.length / 10));
            setLoading(false);
        } catch (error) {
            console.error('Fetch transactions error:', error);
            setError('Failed to fetch transactions');
            setAllTransactions([]);
            setDisplayedTransactions([]);
            setLoading(false);
        }
    };

    const paginatedTransactions = displayedTransactions.slice((page - 1) * 10, page * 10);

    const toggleTypeDropdown = () => {
        setTypeDropdownOpen(!typeDropdownOpen);
    };

    const handleTypeSelect = (type) => {
        setTransactionType(type);
        setTypeDropdownOpen(false);
        setIsSearchActive(false);
        fetchAllRecords();
    };

    const handlePageChange = async (newPage) => {
        setPage(newPage);
        try {
            setLoading(true);
            const response = await getAllRecordsAPI(newPage - 1, 10); // Assuming 0-based page index and 10 items per page
            const transactions = response.data || [];
            setDisplayedTransactions(transactions);
            setTotalPages(Math.ceil(transactions.length / 10));
        } catch (error) {
            console.error('Fetch page error:', error);
            setError('Failed to fetch page');
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        times: [0, 0.5, 1],
                        repeat: Infinity,
                    }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg"
                    role="alert"
                >
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    className="flex flex-col items-center mb-8 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="relative w-full max-w-2xl flex">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-6 py-3 rounded-l-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-blue-500 text-white rounded-r-full hover:bg-blue-600 transition-all duration-300"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-xl overflow-hidden shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Transactions</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <motion.button
                                        onClick={toggleTypeDropdown}
                                        className="px-4 py-2 bg-gray-200 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {transactionType} <ChevronDown className="inline-block ml-1 h-4 w-4" />
                                    </motion.button>
                                    <AnimatePresence>
                                        {typeDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-20"
                                            >
                                                {['All', 'Income', 'Expense'].map((type) => (
                                                    <motion.button
                                                        key={type}
                                                        onClick={() => handleTypeSelect(type)}
                                                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition-all duration-300"
                                                        whileHover={{ backgroundColor: '#f3f4f6' }}
                                                    >
                                                        {type}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <motion.button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {showAddForm ? <X className="inline-block mr-2 h-5 w-5" /> : <Plus className="inline-block mr-2 h-5 w-5" />}
                                    {showAddForm ? 'Close Form' : 'Add Transaction'}
                                </motion.button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-6"
                                >
                                    <div className="bg-gray-100 p-6 rounded-lg">
                                        <h3 className="text-xl font-semibold mb-4">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label  className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    value={transactionForm.type}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Income">Income</option>
                                                    <option value="Expense">Expense</option>
                                                </select>
                                                {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                <input
                                                    type="text"
                                                    value={transactionForm.category}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter category"
                                                />
                                                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                                <input
                                                    type="number"
                                                    value={transactionForm.amount}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter amount"
                                                />
                                                {formErrors.amount && <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Method</label>
                                                <input
                                                    type="text"
                                                    value={transactionForm.transactionMethod}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, transactionMethod: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter transaction method"
                                                />
                                                {formErrors.transactionMethod && <p className="text-red-500 text-xs mt-1">{formErrors.transactionMethod}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={transactionForm.transactionTime}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, transactionTime: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formErrors.transactionTime && <p className="text-red-500 text-xs mt-1">{formErrors.transactionTime}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={transactionForm.transactionDescription}
                                                    onChange={(e) => setTransactionForm({ ...transactionForm, transactionDescription: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter description"
                                                    rows={3}
                                                ></textarea>
                                                {formErrors.transactionDescription && <p className="text-red-500 text-xs mt-1">{formErrors.transactionDescription}</p>}
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                        />
                                    </th>
                                    <th className="p-3 text-left">Type</th>
                                    <th className="p-3 text-left">Category</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Method</th>
                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Description</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                <AnimatePresence>
                                    {paginatedTransactions.map((transaction) => (
                                        <motion.tr
                                            key={transaction.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTransactions.includes(transaction.id)}
                                                    onChange={() => handleSelectTransaction(transaction.id)}
                                                />
                                            </td>
                                            <td className="p-3">{transaction.type}</td>
                                            <td className="p-3">{transaction.category}</td>
                                            <td className={`p-3 ${transaction.type === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                                                ${Number(transaction.amount).toFixed(2)}
                                            </td>
                                            <td className="p-3">{transaction.transactionMethod}</td>
                                            <td className="p-3">{format(parseISO(transaction.transactionTime), 'yyyy-MM-dd HH:mm:ss')}</td>
                                            <td className="p-3">{transaction.transactionDescription}</td>
                                            <td className="p-3">
                                                <motion.button
                                                    onClick={() => handleEditTransaction(transaction)}
                                                    className="mr-2 text-blue-600 hover:text-blue-800"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <motion.button
                                onClick={handleBatchDelete}
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    selectedTransactions.length > 0
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                } transition-all duration-300`}
                                whileHover={selectedTransactions.length > 0 ? { scale: 1.05 } : {}}
                                whileTap={selectedTransactions.length > 0 ? { scale: 0.95 } : {}}
                                disabled={selectedTransactions.length === 0}
                            >
                                <Trash2 className="inline-block mr-2 h-5 w-5" />
                                Delete Selected ({selectedTransactions.length})
                            </motion.button>
                            <div className="flex space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <motion.button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            page === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } transition-all duration-300`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {pageNum}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.button
                className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <ChevronUp className="h-6 w-6" />
            </motion.button>

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg"
                >
                    Transaction action completed successfully.
                </motion.div>
            )}
        </div>
    );
}