import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { updateUserAPI, getProfileAPI } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

const schema = Yup.object().shape({
    username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').min(10, 'Must be exactly 10 digits').max(10, 'Must be exactly 10 digits'),
});

const defaultFormValues = {
    username: '',
    email: '',
    phone: '',
};

const InputField = ({ icon, label, name, control, error, type = 'text' }) => (
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
                        className={`pl-10 ${error ? 'border-red-300' : ''}`}
                        placeholder={label}
                    />
                )}
            />
        </div>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
);

function UserProfile() {
    const [user, setUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await getProfileAPI();
            if (response && response.status === 200) {
                const userData = response.data || {};
                setUser(userData);
                reset({
                    username: userData.username || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                });
            } else {
                throw new Error('Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Fetch user profile error:', error);
            toast({
                title: "Error",
                description: "Failed to load user profile. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        console.log('Form data submitted:', data);

        setIsSubmitting(true);
        try {
            const response = await updateUserAPI({
                username: data.username,
                email: data.email,
                phone: data.phone || null
            });

            if (response && response.status === 200) {
                setUser(response.data);
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                });
                localStorage.setItem("username", data.username)
                await fetchUserProfile();
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-gray-600">Failed to load user profile. Please try again later.</p>
            </div>
        );
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
                            />
                            <InputField
                                icon={<Mail className="text-gray-500" />}
                                label="Email"
                                name="email"
                                control={control}
                                error={errors.email}
                            />
                            <InputField
                                icon={<Phone className="text-gray-500" />}
                                label="Phone"
                                name="phone"
                                control={control}
                                error={errors.phone}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full mt-6"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </form>
                    <Button
                        variant="outline"
                        className="w-full mt-6 opacity-50 cursor-not-allowed"
                        disabled={true}
                    >
                        Change Password (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default UserProfile;