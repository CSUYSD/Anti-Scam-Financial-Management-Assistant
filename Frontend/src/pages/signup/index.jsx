import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, User, Mail, Lock, Calendar, Phone, Check, CheckCircle, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { signUpAPI } from "@/api/user.jsx"

const schema = Yup.object().shape({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    DOB: Yup.date().required('Date of Birth is required').max(new Date(), 'Date of Birth cannot be in the future'),
    fullName: Yup.string().required('Full Name is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits')
})

const formSteps = ['Basic Info', 'Personal Details', 'Review']

export default function SignUp() {
    const [step, setStep] = useState(0)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(null)
    const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm({
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
        const fields = step === 0 ? ['username', 'email', 'password'] : ['fullName', 'DOB', 'phone']
        const isStepValid = await trigger(fields)
        if (isStepValid) setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                window.location.href = '/login'
            }, 3000)
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
                    >
                        <InputField
                            icon={<User className="text-purple-500" />}
                            label="Username"
                            name="username"
                            register={register}
                            error={errors.username}
                        />
                        <InputField
                            icon={<Mail className="text-purple-500" />}
                            label="Email"
                            name="email"
                            register={register}
                            error={errors.email}
                        />
                        <InputField
                            icon={<Lock className="text-purple-500" />}
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            register={register}
                            error={errors.password}
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
                    </motion.div>
                )
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                    >
                        <InputField
                            icon={<User className="text-purple-500" />}
                            label="Full Name"
                            name="fullName"
                            register={register}
                            error={errors.fullName}
                        />
                        <InputField
                            icon={<Calendar className="text-purple-500" />}
                            label="Date of Birth"
                            name="DOB"
                            type="date"
                            register={register}
                            error={errors.DOB}
                        />
                        <InputField
                            icon={<Phone className="text-purple-500" />}
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
                        <h3 className="text-2xl font-bold text-purple-700 mb-4">Review Your Details</h3>
                        {Object.entries(values).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="font-semibold text-purple-700">{key === 'password' ? '••••••••' : value}</span>
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
            className="fixed inset-0 flex items-center justify-center bg-purple-900 bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-lg p-8 max-w-md w-full text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold text-purple-700 mb-4">Sign Up Successful!</h2>
                <p className="text-lg text-gray-600 mb-6">Welcome aboard! Your account has been created successfully.</p>
                <motion.div
                    className="w-full bg-purple-600 h-2 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                />
                <p className="text-sm text-purple-600 mt-4">Redirecting to login page...</p>
            </motion.div>
        </motion.div>
    )

    if (isSuccess) {
        return <SuccessModal />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="p-8">
                        <h2 className="text-4xl font-bold text-center text-purple-700 mb-6">Sign Up</h2>
                        <div className="flex justify-between mb-8">
                            {formSteps.map((formStep, index) => (
                                <div key={formStep} className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            step >= index ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {step > index ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <span>{index + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-sm mt-2 text-gray-500">{formStep}</span>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {error}</span>
                            </div>
                        )}
                        <form>
                            <AnimatePresence mode="wait">
                                {renderFormStep()}
                            </AnimatePresence>
                            <div className="mt-8 flex justify-between">
                                {step > 0 && (
                                    <motion.button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-gray-200 text-purple-700 px-6 py-3 rounded-full font-semibold flex items-center text-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ChevronLeft className="mr-2" />
                                        Back
                                    </motion.button>
                                )}
                                {step < 2 ? (
                                    <motion.button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center ml-auto text-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Next
                                        <ChevronRight className="ml-2" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        className={`bg-green-500 text-white px-6 py-3 rounded-full font-semibold flex items-center ml-auto text-lg ${
                                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </motion.button>
                                )}
                            </div>
                        </form>
                    </div>
                    <div className="bg-purple-100 p-4 text-center">
                        <p className="text-purple-700">
                            Already have an account?{' '}
                            <a href="/login" className="font-semibold hover:underline">
                                Log in
                            </a>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

const InputField = ({ icon, label, name, register, error, type = 'text', rightIcon }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-lg font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                type={type}
                id={name}
                {...register(name)}
                className={`block w-full pl-10 pr-3 py-3 text-lg border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                    error ? 'border-red-300' : ''
                }`}
                placeholder={label}
            />
            {rightIcon}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
)