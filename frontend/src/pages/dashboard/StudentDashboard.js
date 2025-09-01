import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints, referralEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch job applications and referral requests in parallel
            const [applicationsResponse, referralsResponse] = await Promise.all([
                jobEndpoints.getMyApplications(),
                referralEndpoints.getMyRequests()
            ]);

            if (applicationsResponse.data.success) {
                // Fix: Access the correct nested data structure and ensure it's an array
                const applicationsData = applicationsResponse.data?.data?.applications || applicationsResponse.data?.data || [];
                setApplications(Array.isArray(applicationsData) ? applicationsData : []);
            } else {
                setApplications([]);
            }

            if (referralsResponse.data.success) {
                // Fix: Access the correct nested data structure and ensure it's an array
                const referralsData = referralsResponse.data?.data?.referrals || referralsResponse.data?.data || [];
                setReferrals(Array.isArray(referralsData) ? referralsData : []);
            } else {
                setReferrals([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            // Set empty arrays on error to prevent filter errors
            setApplications([]);
            setReferrals([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'hired': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'applied': return 'Applied';
            case 'shortlisted': return 'Shortlisted';
            case 'rejected': return 'Rejected';
            case 'hired': return 'Hired';
            case 'pending': return 'Pending';
            case 'approved': return 'Approved';
            default: return 'Unknown';
        }
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Not specified';
        if (salary.min && salary.max) {
            return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
        }
        if (salary.min) {
            return `$${salary.min.toLocaleString()}+`;
        }
        if (salary.max) {
            return `Up to $${salary.max.toLocaleString()}`;
        }
        return 'Not specified';
    };

    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(ref => ref.status === 'pending').length;
    const approvedReferrals = referrals.filter(ref => ref.status === 'approved').length;

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, {user?.name}! Track your referral requests and manage your profile.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                        <span className="text-purple-600 text-lg">🤝</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Referrals
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {totalReferrals}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                        <span className="text-yellow-600 text-lg">⏳</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Pending Referrals
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {pendingReferrals}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                        <span className="text-green-600 text-lg">✅</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Approved Referrals
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {approvedReferrals}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Get started with your job search
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Link to="/jobs">
                                <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 text-xl">🔍</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-blue-900">Browse Jobs</h3>
                                            <p className="text-xs text-blue-700">Find opportunities that match your skills</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/alerts">
                                <div className="bg-yellow-50 p-4 rounded-lg hover:bg-yellow-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <span className="text-yellow-600 text-xl">🔔</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-yellow-900">View Alerts</h3>
                                            <p className="text-xs text-yellow-700">Notifications and updates</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/messages">
                                <div className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <span className="text-indigo-600 text-xl">💬</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-indigo-900">Messages</h3>
                                            <p className="text-xs text-indigo-700">Chat with others</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/resume">
                                <div className="bg-teal-50 p-4 rounded-lg hover:bg-teal-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <span className="text-teal-600 text-xl">📄</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-teal-900">Build Resume</h3>
                                            <p className="text-xs text-teal-700">Generate and download</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/course">
                                <div className="bg-rose-50 p-4 rounded-lg hover:bg-rose-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                                            <span className="text-rose-600 text-xl">🎓</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-rose-900">6-Month Course</h3>
                                            <p className="text-xs text-rose-700">View and enroll</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link to="/referrals/request">
                                <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <span className="text-green-600 text-xl">🤝</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-green-900">Request Referral</h3>
                                            <p className="text-xs text-green-700">Ask alumni for job referrals</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/profile">
                                <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <span className="text-purple-600 text-xl">👤</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-purple-900">Update Profile</h3>
                                            <p className="text-xs text-purple-700">Keep your profile current</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Applications */}
                {/* Removed as requested - students can view applications in My Applications page */}

                {/* Available Courses */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Enroll in 6-month courses to develop your skills
                                </p>
                            </div>
                            <Link to="/courses">
                                <Button variant="primary" size="sm">
                                    View All Courses
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="px-6 py-8 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Enhance your skills</h3>
                        <p className="text-gray-500">
                            Browse and enroll in 6-month courses offered by recruiters to advance your career.
                        </p>
                        <div className="mt-4">
                            <Link to="/courses">
                                <Button variant="primary">
                                    Browse Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Referral Requests */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Referral Requests</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Track your alumni referral requests
                                </p>
                            </div>
                            <Link to="/referrals/request">
                                <Button variant="primary" size="sm">
                                    Request New Referral
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {referrals.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No referral requests yet</h3>
                            <p className="text-gray-500">
                                Start requesting referrals from alumni to increase your chances.
                            </p>
                            <div className="mt-4">
                                <Link to="/referrals/request">
                                    <Button variant="primary">
                                        Request Referral
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {referrals.map((referral) => (
                                <div key={referral._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(referral.status)}`}>
                                                    {getStatusText(referral.status)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Requested {new Date(referral.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                {referral.jobId?.title || 'Job Title'} at {referral.jobId?.company || 'Company'}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Alumni: {referral.alumniId?.name || 'Alumni Name'} - {referral.alumniId?.profile?.jobTitle || 'Job Title'} at {referral.alumniId?.profile?.company || 'Company'}
                                            </p>

                                            <div className="text-sm text-gray-600 mb-3">
                                                <span className="font-medium">Your Message:</span>
                                                <p className="mt-1">{referral.studentMessage}</p>
                                            </div>

                                            {referral.alumniResponse && (
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                    <span className="font-medium">Alumni Response:</span>
                                                    <p className="mt-1">{referral.alumniResponse}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex-shrink-0">
                                            <Link to={`/jobs/${referral.jobId?._id || '#'}`}>
                                                <Button variant="secondary" size="sm">
                                                    View Job
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

