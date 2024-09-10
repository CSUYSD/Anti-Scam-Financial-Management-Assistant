import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { loginAPI } from "@/api/user.jsx"
import {setToken} from "@/utils/index.jsx";

export default function Login() {
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        const formData = new FormData(event.currentTarget)
        try {
            const response = await loginAPI(formData)
            if (response && response.status === 200) {
                // Successful login
                setToken(response.data.token)
                localStorage.setItem('username', formData.get('username'))
                window.location.href = '/account'
            } else {
                throw new Error('Unexpected response from server')
            }
        } catch (error) {
            console.error('Login error:', error)
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        setError('Invalid username or password')
                        break
                    case 500:
                        setError('An error occurred during login. Please try again later.')
                        break
                    default:
                        setError('An unexpected error occurred. Please try again.')
                }
            } else if (error.request) {
                setError('Unable to connect to the server. Please check your internet connection.')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-8 flex items-center justify-center">
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
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">Login</h1>
                    <p className="text-xl text-blue-400">Welcome back!</p>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="username" className="block text-lg font-medium text-blue-600 mb-2">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="w-full px-3 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg font-medium text-blue-600 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
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
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow text-xl font-semibold mt-8"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <a href="/signup" className="text-blue-500 hover:text-blue-700 transition-colors text-lg">
                        Don't have an account? Sign Up
                    </a>
                </div>
            </motion.div>
        </div>
    )
}