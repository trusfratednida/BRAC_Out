import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSpamMonitor = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        spamThreshold: '3'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0
    });

    useEffect(() => {
        fetchSpamUsers();
    }, [filters, pagination.currentPage]);

    const fetchSpamUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 10,
                spamThreshold: filters.spamThreshold
            };

            const response = await adminEndpoints.getSpamMonitor(params);

            if (response.data?.success) {
                const usersData = response.data?.data?.users || [];
                setUsers(Array.isArray(usersData) ? usersData : []);

                if (response.data?.data?.pagination) {
                    setPagination({
                        currentPage: response.data.data.pagination.currentPage,
                        totalPages: response.data.data.pagination.totalPages,
                        totalUsers: response.data.data.pagination.totalUsers
                    });
                }
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching spam users:', error);
            toast.error('Failed to fetch spam users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, currentBlockedStatus) => {
        try {
            const response = await adminEndpoints.blockUser(userId, {
                isBlocked: !currentBlockedStatus
            });

            if (response.data.success) {
                const newStatus = !currentBlockedStatus;
                toast.success(`User ${newStatus ? 'blocked' : 'unblocked'} successfully`);

                // Update the user in the local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId
                            ? { ...user, isBlocked: newStatus }
                            : user
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling user block:', error);
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleUpdateSpamScore = async (userId, newScore) => {
        try {
            const response = await adminEndpoints.updateSpamScore(userId, {
                spamScore: newScore
            });

            if (response.data.success) {
                toast.success('Spam score updated successfully');

                // Update the user in the local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId
                            ? { ...user, spamScore: newScore }
                            : user
                    )
                );
            }
        } catch (error) {
            console.error('Error updating spam score:', error);
            toast.error(error.response?.data?.message || 'Failed to update spam score');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const getSpamScoreColor = (score) => {
        if (score >= 7) return 'bg-red-100 text-red-800';
        if (score >= 5) return 'bg-orange-100 text-orange-800';
        if (score >= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getSpamScoreLabel = (score) => {
        if (score >= 7) return 'High Risk';
        if (score >= 5) return 'Medium Risk';
        if (score >= 3) return 'Low Risk';
        return 'Safe';
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Spam Monitor</h1>
                    <p className="mt-2 text-gray-600">
                        Monitor and manage users with high spam scores
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Spam Score Threshold
                                </label>
                                <select
                                    value={filters.spamThreshold}
                                    onChange={(e) => handleFilterChange('spamThreshold', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="1">1+ (All Users)</option>
                                    <option value="3">3+ (Low Risk)</option>
                                    <option value="5">5+ (Medium Risk)</option>
                                    <option value="7">7+ (High Risk)</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setFilters({ spamThreshold: '3' });
                                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                                    }}
                                    className="w-full"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">
                                Users with High Spam Scores ({pagination.totalUsers})
                            </h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center">
                            <LoadingSpinner />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No users found matching your criteria
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Spam Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            {user.profile?.photo ? (
                                                                <img
                                                                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${user.profile.photo}`}
                                                                    alt="Profile"
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-600 text-sm">👤</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className={`h-2 rounded-full ${user.spamScore > 7 ? 'bg-red-500' :
                                                                user.spamScore > 5 ? 'bg-orange-500' :
                                                                    user.spamScore > 3 ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${user.spamScore * 10}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-sm font-medium ${getSpamScoreColor(user.spamScore)}`}>
                                                        {user.spamScore}/10
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {getSpamScoreLabel(user.spamScore)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {user.isVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                    {user.isBlocked && (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>

                                                    <Button
                                                        variant={user.isBlocked ? "primary" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                    >
                                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                                    </Button>

                                                    <select
                                                        value={user.spamScore}
                                                        onChange={(e) => handleUpdateSpamScore(user._id, parseInt(e.target.value))}
                                                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                    >
                                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                                            <option key={score} value={score}>{score}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.role}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Spam Score</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.spamScore}/10 - {getSpamScoreLabel(selectedUser.spamScore)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSpamMonitor;
