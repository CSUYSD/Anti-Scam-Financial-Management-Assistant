import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, LogOut, Trash2 } from 'lucide-react'
import { logoutAPI } from "@/api/user"
import { removeToken } from "@/utils/index"
import { getAllAccountsAPI, createAccountAPI, deleteAccountAPI, switchAccountAPI } from '@/api/account'
import WebSocketService from "@/services/WebSocketService.js"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

const handleApiError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 400:
                return 'Invalid request. Please check your input.'
            case 401:
                return 'Unauthorized. Please log in again.'
            case 403:
                return 'You do not have permission to perform this action.'
            case 409:
                return 'Account name already exists. Please choose a different name.'
            case 500:
                return 'Server error. Please try again later.'
            default:
                return error.response.data.message || 'An unknown error occurred.'
        }
    } else if (error.request) {
        return 'Unable to connect to the server. Please check your network connection.'
    } else {
        return 'An error occurred. Please try again later.'
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
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all relative"
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
                            e.stopPropagation()
                            onDelete(account)
                        }}
                    >
                        <Trash2 className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{account.accountName}</h2>
            <p className="text-2xl font-bold text-gray-900 mb-4">
                ${formatBalance(account.totalIncome, account.totalExpense)}
            </p>
            <div className="text-sm text-gray-600 mb-4">
                <p>Total Income: ${account.totalIncome.toFixed(2)}</p>
                <p>Total Expense: ${account.totalExpense.toFixed(2)}</p>
            </div>
            <Button
                className="w-full"
                onClick={() => onSelect(account)}
            >
                Select
            </Button>
        </motion.div>
    )
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
            if (error.response && error.response.status === 404) {
                setAccounts([])
            } else {
                const errorMessage = handleApiError(error)
                setError(errorMessage)
            }
        }
    }

    const handleCreateAccount = async () => {
        if (newAccountName.trim()) {
            try {
                const response = await createAccountAPI({ name: newAccountName })
                const newAccount = { ...response.data, totalIncome: 0, totalExpense: 0 }
                setAccounts([...accounts, newAccount])
                setNewAccountName('')
                setIsModalOpen(false)
                toast({
                    title: "Account Created",
                    description: `Account "${newAccountName}" has been created successfully.`,
                })
                window.location.reload()
            } catch (error) {
                const errorMessage = handleApiError(error)
                setError(errorMessage)
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        }
    }

    const handleSelectAccount = async (account) => {
        try {
            await switchAccountAPI(account.id)
            window.location.href = '/'
        } catch (error) {
            const errorMessage = handleApiError(error)
            setError(errorMessage)
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
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
                toast({
                    title: "Account Deleted",
                    description: `Account "${accountToDelete.accountName}" has been deleted successfully.`,
                })
            } catch (error) {
                const errorMessage = handleApiError(error)
                setError(errorMessage)
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        }
    }

    const handleLogout = async () => {
        try {
            await logoutAPI()
            localStorage.removeItem('username')
            localStorage.removeItem('chatSessions')
            localStorage.removeItem('uploadedFiles')
            removeToken()
            WebSocketService.handleLogout()
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
            const errorMessage = handleApiError(error)
            setError(errorMessage)
            toast({
                title: "Logout Failed",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <Card className="bg-white">
                    <CardHeader className="pb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-4xl font-bold text-gray-800 mb-2">Select an Account</CardTitle>
                                <CardDescription className="text-xl text-gray-600">Welcome back, {username}</CardDescription>
                            </div>
                            <Button variant="outline" onClick={() => setIsLogoutModalOpen(true)}>
                                <LogOut className="mr-2 h-4 w-4" /> Log Out
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
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
                        {accounts.length > 0 ? (
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
                        ) : (
                            <motion.div
                                className="text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="text-xl text-gray-600 mb-4">You don't have any accounts yet.</p>
                                <p className="text-lg text-gray-500">Create your first account to get started!</p>
                            </motion.div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add New Account
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Account</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new account.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        placeholder="Enter account name"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAccount}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to log out?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleLogout}>Logout</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the account "{accountToDelete?.accountName}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeleteAccount}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}