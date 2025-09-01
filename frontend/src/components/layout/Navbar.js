import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    UsersIcon,
    Cog6ToothIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout, hasRole, isVerified } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileDropdownOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const getRoleIcon = () => {
        switch (user?.role) {
            case 'Student':
                return <AcademicCapIcon className="h-5 w-5" />;
            case 'Alumni':
                return <UsersIcon className="h-5 w-5" />;
            case 'Recruiter':
                return <BriefcaseIcon className="h-5 w-5" />;
            case 'Admin':
                return <Cog6ToothIcon className="h-5 w-5" />;
            default:
                return <UserCircleIcon className="h-5 w-5" />;
        }
    };

    const getRoleColor = () => {
        switch (user?.role) {
            case 'Student':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Alumni':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Recruiter':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Admin':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Simplified navigation - only essential public links and role-specific items
    const navigation = [
        { name: 'Jobs', href: '/jobs', public: true },
        ...(user && !hasRole('Admin') ? [
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Courses', href: '/courses', public: true },
            { name: 'Connections', href: '/connections' },
            { name: 'Messages', href: '/messages' },
            ...(hasRole('Student') ? [
                { name: 'My Applications', href: '/jobs/my-applications' },
                { name: 'Request Referral', href: '/referrals/request' },
                { name: 'Mock Questions', href: '/qa' }
            ] : []),
            ...(hasRole('Recruiter') ? [
                { name: 'Post Job', href: '/jobs/post' },
                { name: 'My Postings', href: '/jobs/my-postings' },
                { name: 'Mock Questions', href: '/qa' }
            ] : [])
        ] : [])
    ];

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-soft border-b border-background-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Navigation */}
                    <div className="flex items-center">
                        {/* Brand/Logo */}
                        <div className="flex-shrink-0 mr-8">
                            <Link to="/" className="flex items-center">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-lg">B</span>
                                </div>
                                <span className="text-xl font-bold text-primary-600">BRAC Out</span>
                            </Link>
                        </div>

                        {/* Desktop navigation */}
                        <div className="hidden lg:flex lg:space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.href)
                                        ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                                        : 'text-text-secondary hover:bg-background-50 hover:text-text-primary border border-transparent'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-4">
                        {user ? (
                            <>
                                {/* User info */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-background-100 rounded-lg text-primary-600">
                                            {getRoleIcon()}
                                        </div>
                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getRoleColor()}`}>
                                            {user.role}
                                        </span>
                                    </div>

                                    {!isVerified() && (
                                        <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-warning-50 text-warning-700 border border-warning-200">
                                            ⏳ Pending
                                        </span>
                                    )}
                                </div>

                                {/* Profile dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-background-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                        <img
                                            className="h-8 w-8 rounded-xl object-cover border-2 border-background-200 shadow-sm"
                                            src={user.profile?.photo || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                            alt={user.name}
                                        />
                                        <div className="text-left">
                                            <div className="text-sm font-semibold text-text-primary">{user.name}</div>
                                            <div className="text-xs text-text-secondary">{user.email}</div>
                                        </div>
                                        <ChevronDownIcon className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-background-200 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-background-200">
                                                <div className="text-sm font-semibold text-text-primary">Profile</div>
                                                <div className="text-xs text-text-secondary">Manage your account</div>
                                            </div>
                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-background-50 transition-colors duration-200"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    View Profile
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-error-600 hover:text-error-700 hover:bg-error-50 transition-colors duration-200"
                                                >
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login">
                                    <Button
                                        variant="outline"
                                        size="md"
                                        className="h-9 px-5 rounded-xl border-2 border-background-200 hover:border-primary-300 transition-all duration-300"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button
                                        variant="primary"
                                        size="md"
                                        className="h-9 px-5 rounded-xl shadow-button hover:shadow-medium transform hover:scale-105 transition-all duration-300"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-background-200">
                    {/* Mobile Brand */}
                    <div className="px-4 py-4 border-b border-background-200">
                        <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="text-xl font-bold text-primary-600">BRAC Out</span>
                        </Link>
                    </div>

                    <div className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive(item.href)
                                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                    : 'text-text-secondary hover:bg-background-50 hover:text-text-primary'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {user && (
                        <div className="px-4 py-4 border-t border-background-200 bg-background-50">
                            <div className="flex items-center space-x-3 mb-4">
                                <img
                                    className="h-10 w-10 rounded-xl object-cover border-2 border-background-200 shadow-sm"
                                    src={user.profile?.photo || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                    alt={user.name}
                                />
                                <div className="flex-1">
                                    <div className="text-base font-semibold text-text-primary">{user.name}</div>
                                    <div className="text-sm text-text-secondary">{user.email}</div>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <div className="p-1.5 bg-background-100 rounded-lg text-primary-600">
                                            {getRoleIcon()}
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor()}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Link
                                    to="/profile"
                                    className="block w-full text-left px-4 py-3 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-white rounded-xl transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-3 text-base font-medium text-error-600 hover:text-error-700 hover:bg-error-50 rounded-xl transition-colors duration-200"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
