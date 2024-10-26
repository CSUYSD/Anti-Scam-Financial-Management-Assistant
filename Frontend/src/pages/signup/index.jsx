'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, User, Mail, Lock, Calendar, Phone, Check, CheckCircle, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { signUpAPI } from "@/api/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

const schema = Yup.object().shape({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .matches(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
        ),
    DOB: Yup.date().required('Date of Birth is required').max(new Date(), 'Date of Birth cannot be in the future'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits')
})

const formSteps = ['Basic Info', 'Personal Details', 'Review']

export default function EnhancedSignUp() {
    const [step, setStep] = useState(0)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const { register, handleSubmit, formState: { errors }, trigger, getValues, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    })

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const formData = new FormData()
            Object.keys(data).forEach(key => formData.append(key, data[key]))
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
        } finally {
            setIsSubmitting(false)
        }
    }

    const nextStep = async () => {
        const fields = step === 0 ? ['username', 'email', 'password'] : ['DOB', 'phone']
        const isStepValid = await trigger(fields)
        if (isStepValid) {
            setStep(step + 1)
            if (step === 0) {
                reset({ ...getValues(), DOB: '', phone: '' })
            }
        }
    }

    const prevStep = () => setStep(step - 1)

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isSuccess])

    const renderFormStep = () => {
        switch (step) {
            case 0:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <InputField
                            icon={<User className="text-gray-500" />}
                            label="Username"
                            name="username"
                            register={register}
                            error={errors.username}
                        />
                        <InputField
                            icon={<Mail className="text-gray-500" />}
                            label="Email"
                            name="email"
                            register={register}
                            error={errors.email}
                        />
                        <InputField
                            icon={<Lock className="text-gray-500" />}
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            register={register}
                            error={errors.password}
                            rightIcon={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </Button>
                            }
                        />
                    </motion.div>
                )
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <InputField
                            icon={<Calendar className="text-gray-500" />}
                            label="Date of Birth"
                            name="DOB"
                            type="date"
                            register={register}
                            error={errors.DOB}
                        />
                        <InputField
                            icon={<Phone className="text-gray-500" />}
                            label="Phone"
                            name="phone"
                            register={register}
                            error={errors.phone}
                        />
                    </motion.div>
                )
            case 2:
                const values = getValues()
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-4"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Your Details</h3>
                        {Object.entries(values).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="font-semibold text-gray-900">{key === 'password' ? '••••••••' : value}</span>
                            </div>
                        ))}
                    </motion.div>
                )
            default:
                return null
        }
    }

    const SuccessModal = () => (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Card className="max-w-2xl w-full p-8">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center text-gray-900">Sign Up Successful!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <CheckCircle className="w-32 h-32 text-green-500 mx-auto mb-8" />
                    </motion.div>
                    <CardDescription className="text-xl mb-8">Welcome aboard! Your account has been created successfully.</CardDescription>
                    <Progress value={100} className="w-full h-2 mb-4" />
                    <p className="text-lg text-gray-500 mt-4">Redirecting to login page in 5 seconds...</p>
                </CardContent>
            </Card>
        </motion.div>
    )

    if (isSuccess) {
        return <SuccessModal />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-5xl font-bold text-center text-gray-900">Create Your Account</CardTitle>
                    <CardDescription className="text-xl text-center text-gray-600">Join us today and start your journey!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex justify-between">
                        {formSteps.map((formStep, index) => (
                            <div key={formStep} className="flex flex-col items-center">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold transition-colors duration-300 ${
                                        step >= index ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step > index ? (
                                        <Check className="w-8 h-8" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span className="text-sm mt-2 text-gray-600 font-medium">{formStep}</span>
                            </div>
                        ))}
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
                            <AlertDescription className="text-base">{error}</AlertDescription>
                        </Alert>
                    )}
                    <form className="space-y-6">
                        <AnimatePresence mode="wait">
                            {renderFormStep()}
                        </AnimatePresence>
                        <div className="flex justify-between pt-6">
                            {step > 0 && (
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    variant="outline"
                                    className="flex items-center text-lg px-6 py-3"
                                >
                                    <ChevronLeft className="mr-2 h-5 w-5" />
                                    Back
                                </Button>
                            )}
                            {step < 2 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="ml-auto flex items-center text-lg px-6 py-3"
                                >
                                    Next
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    className="ml-auto text-lg px-8 py-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Create Account'}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-gray-600 text-lg">
                        Already have an account?{' '}
                        <a href="/login" className="font-semibold text-gray-900 hover:underline">
                            Log in
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

const InputField = ({ icon, label, name, register, error, type = 'text', rightIcon }) => (
    <div>
        <Label htmlFor={name} className="text-lg font-medium">
            {label}
        </Label>
        <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <Input
                type={type}
                id={name}
                {...register(name)}
                className={`pl-10 py-3 text-lg ${error ? 'border-red-500' : ''}`}
                placeholder={label}
            />
            {rightIcon}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
)