import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { authAPIJson } from '../../services/api';

const schema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().required('Password is required')
}).required();

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState('checking');

    const from = location.state?.from?.pathname || '/dashboard';

    // Check API connectivity
    useEffect(() => {
        const checkAPI = async () => {
                    try {
            const response = await authAPIJson.get('/health');
            setApiStatus('connected');
        } catch (error) {
            setApiStatus('disconnected');
            toast.error('Cannot connect to server. Please check if the backend is running.');
        }
        };
        checkAPI();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        if (apiStatus !== 'connected') {
            toast.error('Cannot connect to server. Please try again later.');
            return;
        }

        setLoading(true);
        try {
            const result = await login(data.email, data.password);

            if (result.success) {
                toast.success('Login successful!');
                navigate(from, { replace: true });
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (error) {
            toast.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-200">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">
                            <span className="text-primary-600 font-bold text-lg">CR</span>
                        </div>
                    </div>
                    <h2 className="mt-8 text-center text-3xl font-bold text-text-primary tracking-tight">
                        Welcome back
                    </h2>
                    <p className="mt-3 text-center text-base text-text-secondary leading-relaxed">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* API Status Indicator */}
                <div className="text-center">
                    {apiStatus === 'checking' && (
                        <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-warning-50 text-warning-700 border border-warning-200">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-600 mr-2"></div>
                            Checking connection...
                        </div>
                    )}
                    {apiStatus === 'connected' && (
                        <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-success-50 text-success-700 border border-success-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Connected to server
                        </div>
                    )}
                    {apiStatus === 'disconnected' && (
                        <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-error-50 text-error-700 border border-error-200">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Server disconnected
                        </div>
                    )}
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-soft border border-background-200 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                register={register}
                                error={errors.email?.message}
                                required
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                register={register}
                                error={errors.password?.message}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-500 focus:ring-primary-400 border-secondary-300 rounded transition-colors duration-200"
                                />
                                <label htmlFor="remember-me" className="ml-3 block text-sm text-text-secondary">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={loading}
                                disabled={apiStatus !== 'connected'}
                                className="w-full h-12 text-base font-semibold rounded-xl shadow-button hover:shadow-medium transition-all duration-300 transform hover:scale-105"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-base text-text-secondary">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-200"
                        >
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
