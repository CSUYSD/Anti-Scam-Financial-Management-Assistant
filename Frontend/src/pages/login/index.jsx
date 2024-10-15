import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LockIcon, EyeIcon, EyeOffIcon, User, Mail } from 'lucide-react'
import { loginAPI } from "@/api/user.jsx"
import { setToken } from "@/utils/index.jsx"

export default function Login() {
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)
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
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="p-8">
                    <motion.div
                        className="flex flex-col items-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="bg-purple-600 rounded-full p-4 mb-4">
                            <LockIcon className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-purple-700 mb-2">Login</h1>
                        <p className="text-xl text-purple-500">Welcome back!</p>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                                role="alert"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <span className="block sm:inline">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            icon={<User className="text-purple-500" />}
                            label="Username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                        />
                        <InputField
                            icon={<LockIcon className="text-purple-500" />}
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                                </button>
                            }
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>
                        <motion.button
                            type="submit"
                            className={`w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold text-lg ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </form>
                </div>
                <div className="bg-purple-100 p-4 text-center">
                    <p className="text-purple-700">
                        Don't have an account?{' '}
                        <a href="/signup" className="font-semibold hover:underline">
                            Sign up
                        </a>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

const InputField = ({ icon, label, name, type, autoComplete, required, rightIcon }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-lg font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                id={name}
                name={name}
                type={type}
                autoComplete={autoComplete}
                required={required}
                className="block w-full pl-10 pr-3 py-3 text-lg border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder={label}
            />
            {rightIcon}
        </div>
    </div>
)