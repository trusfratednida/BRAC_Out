import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    UserGroupIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    EyeIcon,
    TrashIcon,
    UserIcon,
    BriefcaseIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminReferrals = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchAllReferrals();
    }, []);

    const fetchAllReferrals = async () => {
        try {
            setLoading(true);
            const response = await adminEndpoints.getAllReferrals();

            // Fix: Access the correct nested data structure and ensure it's an array
            const referralsData = response?.data?.data?.referrals || response?.data?.referrals || response?.data || [];
            setReferrals(Array.isArray(referralsData) ? referralsData : []);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            toast.error('Failed to load referrals');
            setReferrals([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReferral = async (referralId) => {
        if (!window.confirm('Are you sure you want to delete this referral? This action cannot be undone.')) {
            return;
        }

        try {
            await adminEndpoints.deleteReferral(referralId);
            setReferrals(prevReferrals => prevReferrals.filter(ref => ref._id !== referralId));
            toast.success('Referral deleted successfully');
        } catch (error) {
            console.error('Error deleting referral:', error);
            toast.error('Failed to delete referral');
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

    // Filter and search referrals
    const filteredReferrals = referrals.filter(referral => {
        const matchesFilter = filter === 'all' || referral.status === filter;

        const matchesSearch = searchTerm === '' ||
            referral.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            referral.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            referral.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            referral.alumni?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Sort referrals
    const sortedReferrals = [...filteredReferrals].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Referrals Management</h1>
                    <p className="text-gray-600">Monitor and manage the referral system across the platform</p>
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
                                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
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

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search referrals by job, student, or alumni..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Filters and Sort */}
                        <div className="flex items-center space-x-4">
                            {/* Filter Tabs */}
                            <div className="flex space-x-1">
                                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${filter === status
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center space-x-2">
                                <FunnelIcon className="w-4 h-4 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="createdAt">Date Requested</option>
                                    <option value="updatedAt">Last Updated</option>
                                    <option value="status">Status</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referrals List */}
                <div className="bg-white rounded-lg shadow-sm">
                    {sortedReferrals.length === 0 ? (
                        <div className="text-center py-12">
                            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {filter === 'all' ? 'No referrals found' : `No ${filter} referrals found`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm
                                    ? `No referrals match your search for "${searchTerm}".`
                                    : 'There are no referral requests on the platform yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {sortedReferrals.map((referral) => (
                                <div key={referral._id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {referral.job?.title || 'Job Title Not Available'}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                                                    {getStatusIcon(referral.status)}
                                                    <span className="ml-2">{getStatusText(referral.status)}</span>
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <BriefcaseIcon className="w-4 h-4 mr-2" />
                                                <span>{referral.job?.company || 'Company Not Available'}</span>
                                                <span className="mx-2">•</span>
                                                <UserIcon className="w-4 h-4 mr-2" />
                                                <span>Student: {referral.student?.name || 'Name Not Available'}</span>
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
                                                        <span className="font-medium">Student Message:</span> {referral.studentMessage}
                                                    </p>
                                                </div>
                                            )}

                                            {referral.alumniResponse && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        <span className="font-medium">Alumni Response:</span> {referral.alumniResponse}
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

                                            {/* Warning for pending referrals */}
                                            {referral.status === 'pending' && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                                    <div className="flex items-start">
                                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                                        <p className="text-sm text-yellow-800">
                                                            This referral request is pending alumni review.
                                                            Consider following up if it remains pending for too long.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/jobs/${referral.job?._id}`)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View Job
                                            </button>

                                            <button
                                                onClick={() => handleDeleteReferral(referral._id)}
                                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <TrashIcon className="w-4 h-4 mr-2" />
                                                Delete
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

export default AdminReferrals;
