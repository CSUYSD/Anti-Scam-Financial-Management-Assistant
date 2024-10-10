import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { logoutAPI } from "@/api/user.jsx"
import { removeToken } from "@/utils/index.jsx"
import { XMarkIcon } from '@heroicons/react/24/solid'
import { getAllAccountsAPI, createAccountAPI, deleteAccountAPI, handleApiError, switchAccountAPI } from '@/api/account'

const shakeAnimation = {
    hover: {
        x: [0, -5, 5, -5, 5, 0],
        transition: {
            duration: 0.4,
        },
    },
}

function AccountCard({ account, onSelect, onDelete }) {
    const [isHovered, setIsHovered] = useState(false)

    const formatBalance = (income, expense) => {
        const balance = income - expense
        return balance.toFixed(2)
    }

    return (
        <motion.div
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 hover:shadow-lg transition-all relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover="hover"
            variants={shakeAnimation}
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
                        <XMarkIcon className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">{account.accountName}</h2>
            <p className="text-2xl font-bold text-blue-900 mb-4">
                ${formatBalance(account.totalIncome, account.totalExpense)}
            </p>
            <div className="text-sm text-gray-600 mb-4">
                <p>Total Income: ${account.totalIncome.toFixed(2)}</p>
                <p>Total Expense: ${account.totalExpense.toFixed(2)}</p>
            </div>
            <button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow"
                onClick={() => onSelect(account)}
            >
                Select
            </button>
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

function Modal({ isOpen, onClose, onSubmit, children, title, submitText }) {
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
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">{title}</h2>
                    {children}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            {submitText}
                        </button>
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
                // Refresh the page immediately after successful account creation
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
            removeToken()
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
            const errorMessage = handleApiError(error)
            setError(errorMessage)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Select an Account</h1>
                    <button
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={() => setIsLogoutModalOpen(true)}
                    >
                        Log Out
                    </button>
                </div>
                <p className="text-xl text-blue-800 mb-8">Welcome back, {username}</p>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
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
                    className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-lg font-semibold shadow-sm hover:shadow"
                    onClick={addNewAccount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    + Add New Account
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
                    className="w-full p-2 border border-blue-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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