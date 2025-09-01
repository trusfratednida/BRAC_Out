import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { referralEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AlumniDashboard = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const response = await referralEndpoints.getAlumniReferrals();

            if (response.data.success) {
                // Fix: Access the correct nested data structure and ensure it's an array
                const referralsData = response.data?.data?.referrals || response.data?.data || [];

                setReferrals(Array.isArray(referralsData) ? referralsData : []);
            } else {
                setReferrals([]);
            }
        } catch (error) {
            toast.error('Failed to fetch referral requests');
            setReferrals([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReferral = async (referralId, responseMessage) => {
        if (!responseMessage.trim()) {
            toast.error('Please provide a response message');
            return;
        }

        setProcessingAction(true);
        try {
            const response = await referralEndpoints.approveReferral(referralId, {
                alumniResponse: responseMessage
            });

            if (response.data.success) {
                toast.success('Referral approved successfully');
                // Update the referral in local state
                setReferrals(prevReferrals =>
                    prevReferrals.map(ref =>
                        ref._id === referralId
                            ? { ...ref, status: 'approved', alumniResponse: responseMessage }
                            : ref
                    )
                );
                setShowModal(false);
                setSelectedReferral(null);
            }
        } catch (error) {
            console.error('Error approving referral:', error);
            toast.error(error.response?.data?.message || 'Failed to approve referral');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRejectReferral = async (referralId, responseMessage) => {
        if (!responseMessage.trim()) {
            toast.error('Please provide a response message');
            return;
        }

        setProcessingAction(true);
        try {
            const response = await referralEndpoints.rejectReferral(referralId, {
                alumniResponse: responseMessage
            });

            if (response.data.success) {
                toast.success('Referral rejected');
                // Update the referral in local state
                setReferrals(prevReferrals =>
                    prevReferrals.map(ref =>
                        ref._id === referralId
                            ? { ...ref, status: 'rejected', alumniResponse: responseMessage }
                            : ref
                    )
                );
                setShowModal(false);
                setSelectedReferral(null);
            }
        } catch (error) {
            console.error('Error rejecting referral:', error);
            toast.error(error.response?.data?.message || 'Failed to reject referral');
        } finally {
            setProcessingAction(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
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

    const pendingReferrals = referrals.filter(ref => ref.status === 'pending');
    const approvedReferrals = referrals.filter(ref => ref.status === 'approved');
    const rejectedReferrals = referrals.filter(ref => ref.status === 'rejected');
    const totalReferrals = referrals.length;

    if (loading && referrals.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Alumni Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, {user?.name}! Manage referral requests from students.
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/test-files`);
                                const data = await response.json();
                                console.log('Test files response:', data);
                                alert(`Resume files: ${data.data.resumeFiles.length}, Cover letter files: ${data.data.coverLetterFiles.length}`);
                            } catch (error) {
                                console.error('Test files error:', error);
                                alert('Error testing files');
                            }
                        }}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Test File Access
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
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
                                            Pending Requests
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {pendingReferrals.length}
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
                                            Approved
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {approvedReferrals.length}
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
                                    <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                        <span className="text-red-600 text-lg">❌</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Rejected
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {rejectedReferrals.length}
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
                                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                        <span className="text-blue-600 text-lg">📊</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Requests
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {totalReferrals}
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
                        <p className="mt-1 text-sm text-gray-600">Navigate to common tasks</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <a href="/alerts">
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
                            </a>
                            <a href="/messages">
                                <div className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <span className="text-indigo-600 text-xl">💬</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-indigo-900">Messages</h3>
                                            <p className="text-xs text-indigo-700">Chat with students</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                            <a href="/profile">
                                <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <span className="text-purple-600 text-xl">👤</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-purple-900">Update Profile</h3>
                                            <p className="text-xs text-purple-700">Keep your info current</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                            <a href="/courses">
                                <div className="bg-teal-50 p-4 rounded-lg hover:bg-teal-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <span className="text-teal-600 text-xl">📚</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-teal-900">Browse Courses</h3>
                                            <p className="text-xs text-teal-700">View available courses</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Pending Referral Requests */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            Pending Referral Requests ({pendingReferrals.length})
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Review and respond to student referral requests
                        </p>
                    </div>

                    {pendingReferrals.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                            <p className="text-gray-500">
                                All referral requests have been processed.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {pendingReferrals.map((referral) => (
                                <div key={referral._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(referral.status)}`}>
                                                    {getStatusText(referral.status)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Requested {new Date(referral.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {referral.jobId?.title || 'Job Title'} at {referral.jobId?.company || 'Company'}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Job Details:</span>
                                                    <p className="text-sm text-gray-900">
                                                        {referral.jobId?.location || 'Location'} • {referral.jobId?.type || 'Type'}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        Salary: {formatSalary(referral.jobId?.salary)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Student:</span>
                                                    <p className="text-sm text-gray-900">{referral.studentId?.name || 'Student Name'}</p>
                                                    <p className="text-sm text-gray-900">
                                                        {referral.studentId?.profile?.department || 'Department'} • {referral.studentId?.profile?.batch || 'Batch'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <span className="text-sm font-medium text-gray-500">Student's Message:</span>
                                                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded">
                                                    {referral.studentMessage}
                                                </p>
                                            </div>

                                            <div className="flex space-x-2">
                                                {referral.resume ? (
                                                    <a
                                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/upload/resume/${referral.resume}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                                    >
                                                        📄 Resume: Download
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                        📄 Resume: Not provided
                                                    </span>
                                                )}
                                                {referral.coverLetter ? (
                                                    <a
                                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/upload/coverletter/${referral.coverLetter}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                                                    >
                                                        📝 Cover Letter: Download
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                        📝 Cover Letter: Not provided
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-6 flex-shrink-0">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedReferral(referral);
                                                    setShowModal(true);
                                                }}
                                            >
                                                Review & Respond
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Courses */}
                <div className="mt-8 bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Browse 6-month courses offered by recruiters
                                </p>
                            </div>
                            <a href="/courses">
                                <Button variant="primary" size="sm">
                                    View All Courses
                                </Button>
                            </a>
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
                            Explore 6-month courses offered by recruiters to advance your career.
                        </p>
                        <div className="mt-4">
                            <a href="/courses">
                                <Button variant="primary">
                                    Browse Courses
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {referrals.length > 0 && (
                    <div className="mt-8 bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Your recent referral decisions
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {referrals.slice(0, 5).map((referral) => (
                                <div key={referral._id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(referral.status)}`}>
                                                    {getStatusText(referral.status)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(referral.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-medium text-gray-900">
                                                {referral.jobId?.title || 'Job Title'} at {referral.jobId?.company || 'Company'}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Student: {referral.studentId?.name || 'Student Name'}
                                            </p>

                                            {referral.alumniResponse && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <span className="font-medium">Your response:</span> {referral.alumniResponse}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showModal && selectedReferral && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Review Referral Request</h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedReferral(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedReferral.jobId?.title} at {selectedReferral.jobId?.company}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                                    <p className="text-sm text-gray-900">
                                        {selectedReferral.studentId?.name} ({selectedReferral.studentId?.profile?.department}, {selectedReferral.studentId?.profile?.batch})
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student's Message</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                        {selectedReferral.studentMessage}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                                    <div className="space-y-2">
                                        {selectedReferral.resume ? (
                                            <a
                                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/upload/resume/${selectedReferral.resume}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                                            >
                                                📄 Download Resume
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                                                📄 Resume: Not provided
                                            </span>
                                        )}
                                        {selectedReferral.coverLetter ? (
                                            <a
                                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/upload/coverletter/${selectedReferral.coverLetter}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                                            >
                                                📝 Download Cover Letter
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                                                📝 Cover Letter: Not provided
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Response *
                                    </label>
                                    <textarea
                                        id="responseMessage"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Provide your feedback and recommendation..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedReferral(null);
                                    }}
                                    disabled={processingAction}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const response = document.getElementById('responseMessage').value;
                                        handleRejectReferral(selectedReferral._id, response);
                                    }}
                                    disabled={processingAction}
                                >
                                    {processingAction ? 'Processing...' : 'Reject'}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        const response = document.getElementById('responseMessage').value;
                                        handleApproveReferral(selectedReferral._id, response);
                                    }}
                                    disabled={processingAction}
                                >
                                    {processingAction ? 'Processing...' : 'Approve'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumniDashboard;
