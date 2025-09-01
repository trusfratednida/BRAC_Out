import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userEndpoints, adminEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        isVerified: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0
    });

    useEffect(() => {
        fetchUsers();
    }, [pagination.currentPage]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms delay for search

        return () => clearTimeout(timeoutId);
    }, [filters.search]);

    // Immediate effect for role and verification status changes
    useEffect(() => {
        fetchUsers();
    }, [filters.role, filters.isVerified]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 10,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await adminEndpoints.getUsers(params);

            if (response.data.success) {
                // Fix: Access the correct nested data structure and ensure it's an array
                const usersData = response.data?.data?.users || response.data?.users || [];
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
            toast.error('Failed to fetch users');
            setUsers([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (userId) => {
        try {
            const response = await userEndpoints.verifyUser(userId);

            if (response.data.success) {
                toast.success('User verified successfully');
                // Update the user in the local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId
                            ? { ...user, isVerified: true }
                            : user
                    )
                );
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify user');
        }
    };

    const handleToggleBlock = async (userId, currentBlockedStatus) => {
        try {
            const response = await userEndpoints.blockUser(userId, {
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
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await userEndpoints.deleteUser(userId);

            if (response.data.success) {
                toast.success('User deleted successfully');
                // Remove the user from the local state
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'blocked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Student': return 'bg-blue-100 text-blue-800';
            case 'Alumni': return 'bg-green-100 text-green-800';
            case 'Recruiter': return 'bg-purple-100 text-purple-800';
            case 'Admin': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && users.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-gray-600">
                        Manage all users, verify alumni, and monitor account status
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Roles</option>
                                    <option value="Student">Student</option>
                                    <option value="Alumni">Alumni</option>
                                    <option value="Recruiter">Recruiter</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Status
                                </label>
                                <select
                                    value={filters.isVerified}
                                    onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Pending</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setFilters({ role: '', isVerified: '', search: '' });
                                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                                    }}
                                    className="w-full"
                                >
                                    Clear Filters
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
                                Users ({pagination.totalUsers})
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
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Spam Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
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
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isVerified ? 'verified' : 'pending')}`}>
                                                        {user.isVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                    {user.isBlocked && (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Blocked
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className={`h-2 rounded-full ${(user.spamScore || 0) > 70 ? 'bg-red-500' :
                                                                (user.spamScore || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${user.spamScore || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-900">{user.spamScore || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
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

                                                    {user.role === 'Alumni' && !user.isVerified && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleVerifyUser(user._id)}
                                                        >
                                                            Verify
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant={user.isBlocked ? "primary" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                                    >
                                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </Button>
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
                                    <label className="block text-sm font-medium text-gray-700">Spam Score</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedUser.spamScore || 0}%</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joined</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {(selectedUser.role === 'Student' || selectedUser.role === 'Alumni') && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Department</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Batch</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.batch || 'N/A'}</p>
                                        </div>
                                    </>
                                )}

                                {selectedUser.role === 'Recruiter' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Company</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.company || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                            <p className="mt-1 text-sm text-gray-900">{selectedUser.profile?.jobTitle || 'N/A'}</p>
                                        </div>
                                    </>
                                )}

                                {selectedUser.role === 'Alumni' && selectedUser.profile?.bracuIdCard && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">BRACU ID Card</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            <a
                                                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/upload/idcard/${selectedUser.profile.bracuIdCard}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View ID Card
                                            </a>
                                        </p>
                                    </div>
                                )}
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

export default AdminUsers;
