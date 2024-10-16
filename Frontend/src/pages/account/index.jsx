import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { logoutAPI } from "@/api/user.jsx"
import { removeToken } from "@/utils/index.jsx"
import { X, Plus, LogOut, Trash2 } from 'lucide-react'
import { getAllAccountsAPI, createAccountAPI, deleteAccountAPI, switchAccountAPI } from '@/api/account'
import WebSocketService from "@/service/WebSocketService.js";

// Define the handleApiError function
const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return error.response.data.message || 'An error occurred with the server response.'
    } else if (error.request) {
        // The request was made but no response was received
        return 'No response received from the server. Please check your internet connection.'
    } else {
        // Something happened in setting up the request that triggered an Error
        return 'An error occurred while setting up the request.'
    }
}

const AccountCard = ({ account, onSelect, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false)

    const formatBalance = (income, expense) => {
        const balance = income - expense
        return balance.toFixed(2)
    }

    return (
        <motion.div
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-all relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.button
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(account);
                        }}
                    >
                        <Trash2 className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
            <h2 className="text-xl font-semibold text-purple-700 mb-4">{account.accountName}</h2>
            <p className="text-2xl font-bold text-purple-900 mb-4">
                ${formatBalance(account.totalIncome, account.totalExpense)}
            </p>
            <div className="text-sm text-gray-600 mb-4">
                <p>Total Income: ${account.totalIncome.toFixed(2)}</p>
                <p>Total Expense: ${account.totalExpense.toFixed(2)}</p>
            </div>
            <motion.button
                className="w-full bg-purple-600 text-white py-2 rounded-full font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(account)}
            >
                Select
            </motion.button>
        </motion.div>
    )
}

AccountCard.propTypes = {
    account: PropTypes.shape({
        id: PropTypes.number.isRequired,
        accountName: PropTypes.string.isRequired,
        totalIncome: PropTypes.number.isRequired,
        totalExpense: PropTypes.number.isRequired,
        transactionRecords: PropTypes.array,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
}

const Modal = ({ isOpen, onClose, onSubmit, children, title, submitText }) => {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-lg p-8 w-96"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">{title}</h2>
                    {children}
                    <div className="flex justify-end space-x-4 mt-6">
                        <motion.button
                            onClick={onClose}
                            className="px-4 py-2 text-purple-600 hover:text-purple-800 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            onClick={onSubmit}
                            className="px-4 py-2 bg-purple-600 text-white rounded-full font-semibold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {submitText}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    submitText: PropTypes.string.isRequired,
}

export default function Account() {
    const [accounts, setAccounts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [newAccountName, setNewAccountName] = useState('')
    const [username, setUsername] = useState('')
    const [accountToDelete, setAccountToDelete] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const storedUsername = localStorage.getItem('username')
        if (storedUsername) {
            setUsername(storedUsername)
        }
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        try {
            const response = await getAllAccountsAPI()
            setAccounts(response.data)
        } catch (error) {
            const errorMessage = handleApiError(error)
            setError(errorMessage)
        }
    }

    const addNewAccount = () => {
        setIsModalOpen(true)
    }

    const handleCreateAccount = async () => {
        if (newAccountName.trim()) {
            try {
                const response = await createAccountAPI({ name: newAccountName })
                const newAccount = { ...response.data, totalIncome: 0, totalExpense: 0 }
                setAccounts([...accounts, newAccount])
                setNewAccountName('')
                setIsModalOpen(false)
                window.location.reload()
            } catch (error) {
                const errorMessage = handleApiError(error)
                setError(errorMessage)
            }
        }
    }

    const handleSelectAccount = async (account) => {
        try {
            console.log('Switching account:', account.id)
            await switchAccountAPI(account.id)
            window.location.href = '/'
        } catch (error) {
            const errorMessage = handleApiError(error)
            setError(errorMessage)
        }
    }

    const handleDeleteAccount = (account) => {
        setAccountToDelete(account)
        setIsDeleteModalOpen(true)
    }

    const confirmDeleteAccount = async () => {
        if (accountToDelete) {
            try {
                await deleteAccountAPI(accountToDelete.id)
                setAccounts(accounts.filter(account => account.id !== accountToDelete.id))
                setIsDeleteModalOpen(false)
                setAccountToDelete(null)
            } catch (error) {
                const errorMessage = handleApiError(error)
                setError(errorMessage)
            }
        }
    }

    const handleLogout = async () => {
        try {
            await logoutAPI()
            localStorage.removeItem('username')
            localStorage.removeItem('chatSessions'); // Clear the chat sessions from local storage
            localStorage.removeItem('uploadedFiles'); // Clear the user profile from local storage
            removeToken()
            WebSocketService.handleLogout()
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
            const errorMessage = handleApiError(error)
            setError(errorMessage)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                    <motion.h1
                        className="text-4xl font-bold text-purple-700"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Select an Account
                    </motion.h1>
                    <motion.button
                        className="text-purple-600 hover:text-purple-800 transition-colors flex items-center"
                        onClick={() => setIsLogoutModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="mr-2" />
                        Log Out
                    </motion.button>
                </div>
                <motion.p
                    className="text-xl text-purple-600 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Welcome back, {username}
                </motion.p>
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
                            role="alert"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onSelect={handleSelectAccount}
                            onDelete={handleDeleteAccount}
                        />
                    ))}
                </motion.div>
                <motion.button
                    className="mt-8 w-full bg-purple-600 text-white py-3 rounded-full text-lg font-semibold flex items-center justify-center"
                    onClick={addNewAccount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="mr-2" />
                    Add New Account
                </motion.button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateAccount}
                title="Create New Account"
                submitText="Create"
            >
                <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Enter account name"
                    className="w-full p-2 border border-purple-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </Modal>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onSubmit={handleLogout}
                title="Confirm Logout"
                submitText="Logout"
            >
                <p className="text-lg text-gray-700">Are you sure you want to log out?</p>
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSubmit={confirmDeleteAccount}
                title="Confirm Delete Account"
                submitText="Delete"
            >
                <p className="text-lg text-gray-700">
                    Are you sure you want to delete the account "{accountToDelete?.accountName}"?
                    This action cannot be undone.
                </p>
            </Modal>
        </div>
    )
}