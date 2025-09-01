import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
    role: yup.string().required('Please select a role'),
    department: yup.string().optional(),
    batch: yup.string().optional(),
    company: yup.string().optional(),
    jobTitle: yup.string().optional(),
    bracuIdCard: yup.mixed().optional()
});

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(schema)
    });

    const watchedRole = watch('role');

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setValue('role', role);
    };

    const onSubmit = async (data) => {
        // Client-side validation for conditional fields
        const errors = {};

        if (data.role === 'Student' || data.role === 'Alumni') {
            if (!data.department) {
                errors.department = 'Department is required for students and alumni';
            }
            if (!data.batch) {
                errors.batch = 'Batch is required for students and alumni';
            }
        }

        if (data.role === 'Recruiter') {
            if (!data.company) {
                errors.company = 'Company name is required for recruiters';
            }
            if (!data.jobTitle) {
                errors.jobTitle = 'Job title is required for recruiters';
            }
        }

        if ((data.role === 'Alumni' || data.role === 'Student') && !data.bracuIdCard?.[0]) {
            errors.bracuIdCard = 'BRACU ID card is required for verification';
        }

        if (Object.keys(errors).length > 0) {
            // Show validation errors
            Object.keys(errors).forEach(field => {
                toast.error(errors[field]);
            });
            return;
        }

        setIsLoading(true);
        try {
            // Create FormData for file uploads
            const formData = new FormData();

            // Add basic user data
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('role', data.role);

            // Add role-specific fields
            if (data.role === 'Student' || data.role === 'Alumni') {
                formData.append('department', data.department);
                formData.append('batch', data.batch);
            }

            if (data.role === 'Recruiter') {
                formData.append('company', data.company);
                formData.append('jobTitle', data.jobTitle);
            }

            // Add ID card file for students and alumni
            if ((data.role === 'Alumni' || data.role === 'Student') && data.bracuIdCard?.[0]) {
                formData.append('bracuIdCard', data.bracuIdCard[0]);
            }

            const response = await authEndpoints.register(formData);

            if (response.data?.success) {
                const message = response.data.message || 'Registration successful!';
                toast.success(message);

                // Auto-login only for recruiters (they don't need verification)
                if (data.role === 'Recruiter') {
                    await login(data.email, data.password);
                    navigate('/dashboard');
                } else if (data.role === 'Alumni' || data.role === 'Student') {
                    // For students and alumni, show message and redirect to login
                    toast.success('Please wait for admin verification before you can access the platform.');
                    navigate('/login');
                } else {
                    navigate('/login');
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-200">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">
                            <span className="text-primary-600 font-bold text-lg">CR</span>
                        </div>
                    </div>
                    <h2 className="mt-8 text-center text-3xl font-bold text-text-primary tracking-tight">
                        Join our platform
                    </h2>
                    <p className="mt-3 text-center text-base text-text-secondary leading-relaxed">
                        Create your account to start your journey
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-soft border border-background-200 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Basic Information */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    register={register}
                                    error={errors.name?.message}
                                    required
                                />

                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    register={register}
                                    error={errors.email?.message}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    register={register}
                                    error={errors.password?.message}
                                    required
                                />

                                <Input
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    register={register}
                                    error={errors.confirmPassword?.message}
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-4">
                            <label className="block text-base font-semibold text-text-primary">
                                Select Your Role *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        role: 'Student',
                                        description: 'Current BRACU student looking for opportunities',
                                        icon: '🎓'
                                    },
                                    {
                                        role: 'Alumni',
                                        description: 'BRACU graduate helping current students',
                                        icon: '👨‍🎓'
                                    },
                                    {
                                        role: 'Recruiter',
                                        description: 'Company representative posting job opportunities',
                                        icon: '💼'
                                    }
                                ].map(({ role, description, icon }) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleChange(role)}
                                        className={`p-4 text-left border-2 rounded-xl transition-all duration-300 ${selectedRole === role
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md transform scale-105'
                                            : 'border-background-200 hover:border-primary-300 hover:bg-background-50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{icon}</div>
                                        <div className="font-semibold text-base mb-1">{role}</div>
                                        <div className="text-sm text-text-secondary leading-relaxed">
                                            {description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {/* Hidden input for form validation */}
                            <input
                                type="hidden"
                                {...register('role')}
                            />
                            {errors.role && (
                                <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Role-specific fields */}
                        {(watchedRole === 'Student' || watchedRole === 'Alumni') && (
                            <div className="space-y-5 p-6 bg-background-50 rounded-xl border border-background-200">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Department"
                                        name="department"
                                        type="text"
                                        placeholder="e.g., Computer Science and Engineering"
                                        register={register}
                                        error={errors.department?.message}
                                        required
                                    />

                                    <Input
                                        label="Batch"
                                        name="batch"
                                        type="text"
                                        placeholder="e.g., 2019-2023"
                                        register={register}
                                        error={errors.batch?.message}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {watchedRole === 'Recruiter' && (
                            <div className="space-y-5 p-6 bg-background-50 rounded-xl border border-background-200">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    Professional Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Company Name"
                                        name="company"
                                        type="text"
                                        placeholder="Enter your company name"
                                        register={register}
                                        error={errors.company?.message}
                                        required
                                    />

                                    <Input
                                        label="Job Title"
                                        name="jobTitle"
                                        type="text"
                                        placeholder="e.g., HR Manager, Recruiter"
                                        register={register}
                                        error={errors.jobTitle?.message}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {(watchedRole === 'Alumni' || watchedRole === 'Student') && (
                            <div className="space-y-4 p-6 bg-background-50 rounded-xl border border-background-200">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    Verification Required
                                </h3>
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-3">
                                        BRACU ID Card *
                                    </label>
                                    <div className="border-2 border-dashed border-background-300 rounded-xl p-6 text-center hover:border-primary-300 transition-colors duration-200">
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            {...register('bracuIdCard')}
                                            className="hidden"
                                            id="bracuIdCard"
                                        />
                                        <label htmlFor="bracuIdCard" className="cursor-pointer">
                                            <div className="text-4xl mb-3">📄</div>
                                            <div className="text-text-primary font-medium mb-2">
                                                Click to upload your BRACU ID card
                                            </div>
                                            <div className="text-text-secondary text-sm">
                                                JPG, PNG, or PDF (Max 5MB)
                                            </div>
                                        </label>
                                    </div>
                                    <p className="mt-3 text-sm text-text-secondary">
                                        Upload your BRACU ID card for verification
                                    </p>
                                    {errors.bracuIdCard && (
                                        <p className="mt-2 text-sm text-error-600">{errors.bracuIdCard.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full h-12 text-base font-semibold rounded-xl shadow-button hover:shadow-medium transition-all duration-300 transform hover:scale-105"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                    <p className="text-base text-text-secondary">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
