import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
    AcademicCapIcon,
    BriefcaseIcon,
    UsersIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    StarIcon,
    ShieldCheckIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import bracuImage from '../asset/Brac_university_at_night.png';

const LandingPage = () => {
    const { user } = useAuth();

    const features = [
        {
            icon: <AcademicCapIcon className="h-10 w-10" />,
            title: 'For Students',
            description: 'Browse job opportunities, apply directly, and request referrals from alumni to boost your career prospects.',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            icon: <UsersIcon className="h-10 w-10" />,
            title: 'For Alumni',
            description: 'Help current students by providing referrals and guidance based on your industry experience.',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            icon: <BriefcaseIcon className="h-10 w-10" />,
            title: 'For Recruiters',
            description: 'Post job opportunities and connect with qualified candidates from our verified student and alumni network.',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        }
    ];

    const benefits = [
        {
            icon: <ShieldCheckIcon className="h-6 w-6" />,
            text: 'Verified user profiles and credentials',
            color: 'text-success-600'
        },
        {
            icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
            text: 'Direct communication between students and alumni',
            color: 'text-primary-600'
        },
        {
            icon: <BriefcaseIcon className="h-6 w-6" />,
            text: 'Comprehensive job posting and application system',
            color: 'text-warning-600'
        },
        {
            icon: <ClockIcon className="h-6 w-6" />,
            text: 'Real-time notifications and updates',
            color: 'text-secondary-600'
        },
        {
            icon: <StarIcon className="h-6 w-6" />,
            text: 'Secure file uploads for resumes and documents',
            color: 'text-purple-600'
        },
        {
            icon: <ShieldCheckIcon className="h-6 w-6" />,
            text: 'Admin moderation and spam protection',
            color: 'text-success-600'
        }
    ];

    const stats = [
        { number: '1000+', label: 'Active Students' },
        { number: '500+', label: 'Alumni Network' },
        { number: '100+', label: 'Partner Companies' },
        { number: '95%', label: 'Success Rate' }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={bracuImage}
                        alt="Brac University at Night"
                        className="w-full h-full object-cover"
                    />
                    {/* Enhanced overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="relative pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                                    <span className="text-white text-sm font-medium">🚀 #1 Campus Recruitment Platform</span>
                                </div>
                                <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
                                    <span className="block">BRAC Out</span>
                                    <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                                        Campus Recruitment Made Simple
                                    </span>
                                </h1>
                                <p className="mt-6 text-lg text-gray-200 sm:text-xl sm:max-w-xl sm:mx-auto md:mt-6 md:text-2xl lg:mx-0 leading-relaxed">
                                    BRAC Out connects students, alumni, and recruiters in a comprehensive platform designed to streamline campus recruitment and referral processes.
                                </p>
                                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                    {user ? (
                                        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                                            <Link to="/dashboard">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="h-14 px-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Go to Dashboard
                                                    <ArrowRightIcon className="ml-2 h-6 w-6" />
                                                </Button>
                                            </Link>
                                            <Link to="/jobs">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="h-14 px-8 text-lg font-semibold bg-white/90 text-gray-900 hover:bg-white rounded-xl border-2 border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Browse Jobs
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                                            <Link to="/register">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="h-14 px-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Get Started Free
                                                    <ArrowRightIcon className="ml-2 h-6 w-6" />
                                                </Button>
                                            </Link>
                                            <Link to="/login">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="h-14 px-8 text-lg font-semibold bg-white/90 text-gray-900 hover:bg-white rounded-xl border-2 border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Sign In
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Right side content */}
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <div className="h-56 w-full lg:w-full lg:h-full flex items-center justify-center">
                        <div className="text-center text-white bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
                            <BuildingOfficeIcon className="h-32 w-32 mx-auto mb-6 opacity-90" />
                            <h2 className="text-3xl font-bold mb-3">Building Careers Together</h2>
                            <p className="text-xl opacity-90">At Brac University</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-gradient-to-r from-background-50 to-background-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-lg text-text-secondary font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
                            ✨ Features
                        </div>
                        <h2 className="text-4xl font-bold text-text-primary mb-6">
                            Everything you need for campus recruitment
                        </h2>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            BRAC Out provides comprehensive tools for students, alumni, and recruiters to connect and grow together.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group">
                                <div className={`p-8 rounded-2xl border-2 ${feature.borderColor} ${feature.bgColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-primary mb-4">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed text-lg">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-20 bg-gradient-to-br from-background-50 to-background-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-50 text-success-700 text-sm font-semibold mb-4">
                            🎯 Why Choose Us
                        </div>
                        <h2 className="text-4xl font-bold text-text-primary mb-6">
                            Trusted by campus communities
                        </h2>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            BRAC Out provides a secure, efficient, and user-friendly platform for all your recruitment needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1">
                                <div className={`flex-shrink-0 p-2 rounded-lg bg-background-100 ${benefit.color}`}>
                                    {benefit.icon}
                                </div>
                                <p className="text-lg text-text-primary font-medium leading-relaxed">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        <span className="block">Ready to get started?</span>
                        <span className="block">Join our community today.</span>
                    </h2>
                    <p className="text-xl leading-relaxed text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join BRAC Out to connect with students, alumni, and recruiters. Start your journey towards better career opportunities.
                    </p>
                    {!user && (
                        <div className="flex justify-center">
                            <Link to="/register">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="h-14 px-10 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                >
                                    Sign up for free
                                    <ArrowRightIcon className="ml-2 h-6 w-6" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
