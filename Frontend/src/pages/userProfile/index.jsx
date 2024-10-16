import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Calendar, Phone, Check, CheckCircle, EyeIcon, EyeOffIcon, Save, Edit } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { updateUserAPI, updatePasswordAPI, getProfileAPI } from "@/api/user"
import { Snackbar, Alert } from '@mui/material'


const schema = Yup.object().shape({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    fullName: Yup.string().required('Full Name is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits'),
    birthday: Yup.date().required('Date of Birth is required').max(new Date(), 'Date of Birth cannot be in the future'),
})


const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
})


export default function UserProfile() {
    const [user, setUser] = useState(null)
    const [editing, setEditing] = useState(false)
    const [passwordDialog, setPasswordDialog] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })


    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange'
    })


    const { control: passwordControl, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
        resolver: yupResolver(passwordSchema),
        mode: 'onChange'
    })


    useEffect(() => {
        fetchUserProfile()
    }, [])


    const fetchUserProfile = async () => {
        try {
            const response = await getProfileAPI()
            if (response && response.status === 200) {
                setUser(response.data)
                reset(response.data)
            } else {
                throw new Error('Failed to fetch user profile')
            }
        } catch (error) {
            console.error('Fetch user profile error:', error)
            setSnackbar({ open: true, message: 'Failed to load user profile. Please try again later.', severity: 'error' })
        }
    }


    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const response = await updateUserAPI(user.id, data)
            if (response && response.status === 200) {
                setUser(response.data)
                setEditing(false)
                setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' })
                // Refresh the user data to ensure we have the latest information from the database
                fetchUserProfile()
            } else {
                throw new Error('Failed to update profile')
            }
        } catch (error) {
            console.error('Update profile error:', error)
            setSnackbar({ open: true, message: 'Failed to update profile. Please try again.', severity: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }


    const onPasswordSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const response = await updatePasswordAPI(user.id, data.currentPassword, data.newPassword)
            if (response && response.status === 200) {
                setPasswordDialog(false)
                resetPassword()
                setSnackbar({ open: true, message: 'Password updated successfully', severity: 'success' })
            } else {
                throw new Error('Failed to update password')
            }
        } catch (error) {
            console.error('Update password error:', error)
            setSnackbar({ open: true, message: 'Failed to update password. Please try again.', severity: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }


    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setSnackbar({ ...snackbar, open: false })
    }


    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-xl text-purple-700">Loading profile...</p>
                </div>
            </div>
        )
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
                        <div className="flex justify-between items-center mb-6">
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
                                        icon={<User className="text-purple-500" />}
                                        label="Full Name"
                                        name="fullName"
                                        control={control}
                                        error={errors.fullName}
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
                                <motion.button
                                    type="submit"
                                    className={`w-full bg-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center mt-6 text-lg ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Profile'}
                                </motion.button>
                            )}
                        </form>
                        <motion.button
                            onClick={() => setPasswordDialog(true)}
                            className="w-full bg-gray-200 text-purple-700 px-6 py-3 rounded-full font-semibold flex items-center justify-center mt-6 text-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Change Password
                        </motion.button>
                    </div>
                </motion.div>
            </div>
            {passwordDialog && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
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
                            <div className="flex justify-end mt-6">
                                <motion.button
                                    type="button"
                                    onClick={() => setPasswordDialog(false)}
                                    className="bg-gray-200 text-purple-700 px-4 py-2 rounded-full font-semibold mr-4"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className={`bg-purple-600 text-white px-4 py-2 rounded-full font-semibold ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Password'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}


const InputField = ({ icon, label, name, control, error, type = 'text', rightIcon, disabled = false }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-lg font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type={type}
                        id={name}
                        className={`block w-full pl-10 pr-3 py-3 text-lg border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
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

