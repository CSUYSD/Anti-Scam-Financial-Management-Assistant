
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
import { toast } from "@/hooks/use-toast"

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
            toast({
                title: "Error",
                description: "Failed to load user profile. Please try again later.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = async (data) => {
        if (!user || !user.id) {
            toast({
                title: "Error",
                description: "User ID is missing. Unable to update profile.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await updateUserAPI(user.id, data)
            if (response && response.status === 200) {
                setUser(response.data)
                setEditing(false)
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                })
                fetchUserProfile()
            } else {
                throw new Error('Failed to update profile')
            }
        } catch (error) {
            console.error('Update profile error:', error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const onPasswordSubmit = async (data) => {
        if (!user || !user.id) {
            toast({
                title: "Error",
                description: "User ID is missing. Unable to update password.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const response = await updatePasswordAPI(user.id, data.currentPassword, data.newPassword)
            if (response && response.status === 200) {
                setPasswordDialog(false)
                resetPassword()
                toast({
                    title: "Success",
                    description: "Password updated successfully",
                })
            } else {
                throw new Error('Failed to update password')
            }
        } catch (error) {
            console.error('Update password error:', error)
            toast({
                title: "Error",
                description: "Failed to update password. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-gray-600">Loading profile...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-gray-600">Failed to load user profile. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-3xl font-bold text-gray-800">User Profile</h2>
                        <Button
                            onClick={() => setEditing(!editing)}
                            variant={editing ? "default" : "outline"}
                        >
                            {editing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                            {editing ? 'Save' : 'Edit'}
                        </Button>
                    </div>
                    <div className="flex justify-center mb-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <InputField
                                icon={<User className="text-gray-500" />}
                                label="Username"
                                name="username"
                                control={control}
                                error={errors.username}
                                disabled={!editing}
                            />
                            <InputField
                                icon={<Mail className="text-gray-500" />}
                                label="Email"
                                name="email"
                                control={control}
                                error={errors.email}
                                disabled={!editing}
                            />
                            <InputField
                                icon={<Phone className="text-gray-500" />}
                                label="Phone"
                                name="phone"
                                control={control}
                                error={errors.phone}
                                disabled={!editing}
                            />
                            <InputField
                                icon={<Calendar className="text-gray-500" />}
                                label="Birthday"
                                name="birthday"
                                type="date"
                                control={control}
                                error={errors.birthday}
                                disabled={!editing}
                            />
                        </div>
                        {editing && (
                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Profile'}
                            </Button>
                        )}
                    </form>
                    <Button
                        onClick={() => setPasswordDialog(true)}
                        variant="outline"
                        className="w-full mt-6"
                    >
                        Change Password
                    </Button>
                </CardContent>
            </Card>

            <AnimatePresence>
                {passwordDialog && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className="w-full max-w-md">
                            <CardContent className="p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h3>
                                <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
                                    <InputField
                                        icon={<Lock className="text-gray-500" />}
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
                                        icon={<Lock className="text-gray-500" />}
                                        label="New Password"
                                        name="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        control={passwordControl}
                                        error={passwordErrors.newPassword}
                                    />
                                    <InputField
                                        icon={<Lock className="text-gray-500" />}
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
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const InputField = ({ icon, label, name, control, error, type = 'text', rightIcon, disabled = false }) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
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
                        className={`pl-10 ${error ? 'border-red-300' : ''} ${disabled ? 'bg-gray-100' : ''}`}
                        placeholder={label}
                        disabled={disabled}
                    />
                )}
            />
            {rightIcon}
        </div>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
)