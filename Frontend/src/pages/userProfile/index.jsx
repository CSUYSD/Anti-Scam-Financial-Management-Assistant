'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Calendar, Phone, Save, Edit, EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { updateUserAPI, updatePasswordAPI, getProfileAPI } from "@/api/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom'

const schema = Yup.object().shape({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits'),
    birthday: Yup.date().required('Date of Birth is required').max(new Date(), 'Date of Birth cannot be in the future'),
})

const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
})

const defaultFormValues = {
    username: '',
    email: '',
    phone: '',
    birthday: '',
}

export default function UserProfile() {
    const [user, setUser] = useState(null)
    const [editing, setEditing] = useState(false)
    const [passwordDialog, setPasswordDialog] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: defaultFormValues,
    })

    const { control: passwordControl, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
        resolver: yupResolver(passwordSchema),
        mode: 'onChange',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        setLoading(true)
        try {
            const response = await getProfileAPI()
            if (response && response.status === 200) {
                const userData = response.data || {}
                setUser(userData)
                reset({
                    username: userData.username || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    birthday: userData.birthday || '',
                })
            } else {
                throw new Error('Failed to fetch user profile')
            }
        } catch (error) {
            console.error('Fetch user profile error:', error)
            showNotification('Failed to load user profile. Please try again later.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data) => {
        if (!user || !user.id) {
            showNotification('User ID is missing. Unable to update profile.', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await updateUserAPI(user.id, data)
            if (response && response.status === 200) {
                setUser(response.data)
                setEditing(false)
                showNotification('Profile updated successfully', 'success')
                fetchUserProfile()
            } else {
                throw new Error('Failed to update profile')
            }
        } catch (error) {
            console.error('Update profile error:', error)
            showNotification('Failed to update profile. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const onPasswordSubmit = async (data) => {
        if (!user || !user.id) {
            showNotification('User ID is missing. Unable to update password.', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await updatePasswordAPI(user.id, data.currentPassword, data.newPassword)
            if (response && response.status === 200) {
                setPasswordDialog(false)
                resetPassword()
                showNotification('Password updated successfully', 'success')
            } else {
                throw new Error('Failed to update password')
            }
        } catch (error) {
            console.error('Update password error:', error)
            showNotification('Failed to update password. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type })
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                <Card className="w-96 h-32 flex items-center justify-center">
                    <CardContent>
                        <p className="text-xl text-purple-700">Loading profile...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                <Card className="w-96 h-32 flex items-center justify-center">
                    <CardContent>
                        <p className="text-xl text-purple-700">Failed to load user profile. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic background */}
            <div className="absolute inset-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                        <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.2)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern)" />
                </svg>
            </div>

            <div className="w-full max-w-2xl z-10">
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                onClick={() => navigate('/')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h2 className="text-4xl font-bold text-purple-700">User Profile</h2>
                            <motion.button
                                onClick={() => setEditing(!editing)}
                                className={`${editing ? 'bg-green-500' : 'bg-purple-600'} text-white px-4 py-2 rounded-full font-semibold flex items-center`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {editing ? <Save className="mr-2" /> : <Edit className="mr-2" />}
                                {editing ? 'Save' : 'Edit'}
                            </motion.button>
                        </div>
                        <div className="flex justify-center mb-6">
                            <Avatar className="w-32 h-32">
                                <AvatarImage src={user.avatarUrl} alt={user.username} />
                                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <InputField
                                        icon={<User className="text-purple-500" />}
                                        label="Username"
                                        name="username"
                                        control={control}
                                        error={errors.username}
                                        disabled={!editing}
                                    />
                                    <InputField
                                        icon={<Mail className="text-purple-500" />}
                                        label="Email"
                                        name="email"
                                        control={control}
                                        error={errors.email}
                                        disabled={!editing}
                                    />
                                    <InputField
                                        icon={<Phone className="text-purple-500" />}
                                        label="Phone"
                                        name="phone"
                                        control={control}
                                        error={errors.phone}
                                        disabled={!editing}
                                    />
                                    <InputField
                                        icon={<Calendar className="text-purple-500" />}
                                        label="Birthday"
                                        name="birthday"
                                        type="date"
                                        control={control}
                                        error={errors.birthday}
                                        disabled={!editing}
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {editing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </motion.div>
                            )}
                        </form>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                onClick={() => setPasswordDialog(true)}
                                variant="outline"
                                className="w-full mt-6"
                            >
                                Change Password
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
            <AnimatePresence>
                {passwordDialog && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-lg p-8 w-full max-w-md"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h3 className="text-2xl font-bold text-purple-700 mb-6">Change Password</h3>
                            <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
                                <InputField
                                    icon={<Lock className="text-purple-500" />}
                                    label="Current Password"
                                    name="currentPassword"
                                    type={showPassword ? "text" : "password"}
                                    control={passwordControl}
                                    error={passwordErrors.currentPassword}
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
                                <InputField
                                    icon={<Lock className="text-purple-500" />}
                                    label="New Password"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    control={passwordControl}
                                    error={passwordErrors.newPassword}
                                />
                                <InputField
                                    icon={<Lock className="text-purple-500" />}
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    control={passwordControl}
                                    error={passwordErrors.confirmPassword}
                                />
                                <div className="flex justify-end mt-6 space-x-4">
                                    <Button
                                        type="button"
                                        onClick={() => setPasswordDialog(false)}
                                        variant="outline"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const InputField = ({ icon, label, name, control, error, type = 'text', rightIcon, disabled = false }) => (
    <div className="mb-6">
        <Label htmlFor={name} className="text-lg font-medium text-gray-700 mb-2">
            {label}
        </Label>
        <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        {...field}
                        type={type}
                        id={name}
                        className={`pl-10 pr-3 py-3 text-lg ${
                            error ? 'border-red-300' : ''
                        } ${disabled ? 'bg-gray-100' : ''}`}
                        placeholder={label}
                        disabled={disabled}
                    />
                )}
            />
            {rightIcon}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
)