import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { referralEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    PlusIcon,
    EyeIcon,
    UserIcon,
    BriefcaseIcon,
    CalendarIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const MyReferrals = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyReferrals();
    }, []);

    const fetchMyReferrals = async () => {
        try {
            setLoading(true);
            const response = await referralEndpoints.getMyRequests();
            // Ensure we get an array from the response
            const referralsData = response.data?.data?.referrals || response.data?.referrals || response.data || [];
            setReferrals(Array.isArray(referralsData) ? referralsData : []);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            toast.error('Failed to load referrals');
            setReferrals([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            case 'approved': return <CheckCircleIcon className="w-4 h-4" />;
            case 'rejected': return <XCircleIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
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

    const filteredReferrals = referrals.filter(referral => {
        if (filter === 'all') return true;
        return referral.status === filter;
    });

    const getStats = () => {
        const total = referrals.length;
        const pending = referrals.filter(ref => ref.status === 'pending').length;
        const approved = referrals.filter(ref => ref.status === 'approved').length;
        const rejected = referrals.filter(ref => ref.status === 'rejected').length;

        return { total, pending, approved, rejected };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Referral Requests</h1>
                        <p className="text-gray-600">Track your referral requests and their current status</p>
                    </div>
                    <button
                        onClick={() => navigate('/referrals/request')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Request New Referral
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircleIcon className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex space-x-1">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === status
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                {status !== 'all' && (
                                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                        {referrals.filter(ref => ref.status === status).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Referrals List */}
                <div className="bg-white rounded-lg shadow-sm">
                    {filteredReferrals.length === 0 ? (
                        <div className="text-center py-12">
                            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {filter === 'all' ? 'No referral requests yet' : `No ${filter} referral requests`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all'
                                    ? 'Start requesting referrals to see them here.'
                                    : `You don't have any ${filter} referral requests at the moment.`
                                }
                            </p>
                            {filter === 'all' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/referrals/request')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Request Your First Referral
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredReferrals.map((referral) => (
                                <div key={referral._id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {referral.jobId?.title || 'Job Title Not Available'}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                                                    {getStatusIcon(referral.status)}
                                                    <span className="ml-2">{getStatusText(referral.status)}</span>
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <BriefcaseIcon className="w-4 h-4 mr-2" />
                                                <span>{referral.jobId?.company || 'Company Not Available'}</span>
                                                <span className="mx-2">•</span>
                                                <UserIcon className="w-4 h-4 mr-2" />
                                                <span>Alumni: {referral.alumni?.name || 'Name Not Available'}</span>
                                                <span className="mx-2">•</span>
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                <span>Requested {new Date(referral.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            {referral.studentMessage && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Your Message:</span> {referral.studentMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {referral.alumniResponse && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="flex items-start">
                                                        <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-900 mb-1">Alumni Response:</p>
                                                            <p className="text-sm text-blue-800">{referral.alumniResponse}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {referral.status === 'approved' && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                                    <p className="text-sm text-green-800">
                                                        🎉 Congratulations! Your referral request has been approved!
                                                        The alumni has agreed to refer you for this position.
                                                    </p>
                                                </div>
                                            )}

                                            {referral.status === 'rejected' && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                    <p className="text-sm text-red-800">
                                                        Unfortunately, your referral request was not approved.
                                                        Don't give up - try requesting referrals from other alumni!
                                                    </p>
                                                </div>
                                            )}

                                            {referral.status === 'pending' && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                                    <p className="text-sm text-yellow-800">
                                                        ⏳ Your referral request is currently under review by the alumni.
                                                        You'll receive a response soon.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Resume and Cover Letter Info */}
                                            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                                                {referral.resume && (
                                                    <div className="flex items-center">
                                                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                                                        <span>Resume: {referral.resume}</span>
                                                    </div>
                                                )}
                                                {referral.coverLetter && (
                                                    <div className="flex items-center">
                                                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                                                        <span>Cover Letter: {referral.coverLetter}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-6 flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/jobs/${referral.jobId?._id}`)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View Job
                                            </button>
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

export default MyReferrals;
