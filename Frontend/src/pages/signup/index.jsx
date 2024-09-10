import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LockIcon, CheckCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { signUpAPI } from "@/api/user.jsx"

export default function SignUp() {
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [formErrors, setFormErrors] = useState({})

    const validateForm = (formData) => {
        const errors = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formData.get('username')) errors.username = 'Username is required'
        if (!emailRegex.test(formData.get('email'))) errors.email = 'Invalid email address'
        if (formData.get('password').length < 8) errors.password = 'Password must be at least 8 characters'
        if (!formData.get('DOB')) errors.DOB = 'Date of Birth is required'
        if (!formData.get('fullName')) errors.fullName = 'Full Name is required'
        if (!formData.get('phone')) errors.phone = 'Phone number is required'

        return errors
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setFormErrors({})
        const formData = new FormData(event.currentTarget)
        const errors = validateForm(formData)

        if (Object.keys(errors).length === 0) {
            try {
                const response = await signUpAPI(formData)
                if (response && response.status === 201) {
                    setIsSuccess(true)
                } else {
                    throw new Error(response.data || 'An unexpected error occurred')
                }
            } catch (error) {
                console.error('Sign up failed:', error)
                if (error.response && error.response.status === 409) {
                    setError('Username already exists. Please choose a different username.')
                } else {
                    setError('Sign up failed. Please try again. ' + (error.message || ''))
                }
            }
        } else {
            setFormErrors(errors)
        }
    }

    const SuccessModal = () => {
        useEffect(() => {
            const timer = setTimeout(() => {
                window.location.href = '/login'
            }, 3000)
            return () => clearTimeout(timer)
        }, [])

        return (
            <motion.div
                className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8 max-w-md w-full shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-blue-600 mb-4 text-center">Welcome Aboard!</h2>
                    <p className="text-xl text-blue-800 mb-6 text-center">Your account has been successfully created.</p>
                    <motion.div
                        className="w-full bg-blue-600 h-2 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                    />
                    <p className="text-sm text-blue-600 mt-4 text-center">Redirecting to login page...</p>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-8 flex items-center justify-center">
            <AnimatePresence>
                {isSuccess && <SuccessModal />}
            </AnimatePresence>
            <motion.div
                className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="bg-blue-500 rounded-full p-4 mb-6">
                        <LockIcon className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">Sign Up</h1>
                    <p className="text-xl text-blue-400">Join our community today</p>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="username" className="block text-lg font-medium text-blue-600 mb-2">Username</label>
                            <input id="username" name="username" required className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-lg font-medium text-blue-600 mb-2">Email Address</label>
                            <input id="email" name="email" type="email" required className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg font-medium text-blue-600 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-lg font-medium text-blue-600 mb-2">Date of Birth</label>
                            <input id="dateOfBirth" name="DOB" type="date" required className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {formErrors.DOB && <p className="text-red-500 text-sm mt-1">{formErrors.DOB}</p>}
                        </div>
                        <div>
                            <label htmlFor="fullName" className="block text-lg font-medium text-blue-600 mb-2">Full Name</label>
                            <input id="fullName" name="fullName" required className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-lg font-medium text-blue-600 mb-2">Phone Number</label>
                            <input id="phoneNumber" name="phone" type="tel" required className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow text-xl font-semibold mt-8"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <a href="/login" className="text-blue-500 hover:text-blue-700 transition-colors text-lg">
                        Already have an account? Login
                    </a>
                </div>
            </motion.div>
        </div>
    )
}