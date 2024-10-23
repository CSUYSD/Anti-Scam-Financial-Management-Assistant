"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LockIcon, EyeIcon, EyeOffIcon, User } from 'lucide-react'
import { loginAPI } from "@/api/user"
import { setToken } from "@/utils/index"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

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
                setToken(response.data.token)
                localStorage.setItem('username', formData.get('username'))
                toast({
                    title: "Login Successful",
                    description: "You have been successfully logged in.",
                })
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
            toast({
                title: "Login Failed",
                description: error.message || "An error occurred during login.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                <Card className="bg-white">
                    <CardHeader className="pb-8">
                        <div className="flex flex-col items-center">
                            <div className="bg-gray-800 rounded-full p-6 mb-6">
                                <LockIcon className="h-14 w-14 text-white" />
                            </div>
                            <CardTitle className="text-5xl font-bold text-gray-800 mb-3">Login</CardTitle>
                            <CardDescription className="text-2xl text-gray-600">Welcome back!</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded relative mb-8"
                                    role="alert"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <span className="block sm:inline text-lg">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="username" className="text-gray-700 text-lg">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        className="pl-14 py-6 text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-gray-700 text-lg">Password</Label>
                                <div className="relative">
                                    <LockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="pl-14 pr-14 py-6 text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? <EyeOffIcon className="h-6 w-6 text-gray-400" /> : <EyeIcon className="h-6 w-6 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Checkbox id="remember-me" className="h-5 w-5" />
                                    <Label htmlFor="remember-me" className="text-gray-600 text-lg">Remember me</Label>
                                </div>
                                <Button variant="link" className="text-gray-600 hover:text-gray-800 text-lg">
                                    Forgot your password?
                                </Button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-xl"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="bg-gray-100 justify-center py-6">
                        <p className="text-gray-700 text-lg">
                            Don't have an account?{' '}
                            <a href="/signup" className="font-semibold text-gray-900 hover:underline">
                                Sign Up
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}