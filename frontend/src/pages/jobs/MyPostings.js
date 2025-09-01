import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    BriefcaseIcon,
    MapPinIcon,
    CalendarIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UsersIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const MyPostings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyPostings();
    }, []);

    const fetchMyPostings = async () => {
        try {
            setLoading(true);
            const response = await jobEndpoints.getMyPostings();

            // Fix: Access the correct nested data structure and ensure it's an array
            const jobsData = response?.data?.data?.jobs || response?.data?.jobs || response?.data || [];
            setJobs(Array.isArray(jobsData) ? jobsData : []);
        } catch (error) {
            console.error('Error fetching job postings:', error);
            toast.error('Failed to load job postings');
            setJobs([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await jobEndpoints.updateJob(jobId, { isActive: newStatus === 'active' });

            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job._id === jobId
                        ? { ...job, isActive: newStatus === 'active' }
                        : job
                )
            );

            toast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating job status:', error);
            toast.error('Failed to update job status');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
            return;
        }

        try {
            await jobEndpoints.deleteJob(jobId);
            setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
            toast.success('Job deleted successfully');
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error('Failed to delete job');
        }
    };

    const getStatusColor = (status) => {
        return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getStatusIcon = (status) => {
        return status ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />;
    };

    const getStatusText = (status) => {
        return status ? 'Active' : 'Inactive';
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        if (filter === 'active') return job.isActive;
        if (filter === 'inactive') return !job.isActive;
        return true;
    });

    const getStats = () => {
        const total = jobs.length;
        const active = jobs.filter(job => job.isActive).length;
        const inactive = jobs.filter(job => !job.isActive).length;
        const totalApplications = jobs.reduce((sum, job) => sum + (job.applications || 0), 0);
        const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

        return { total, active, inactive, totalApplications, totalViews };
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Postings</h1>
                        <p className="text-gray-600">Manage your job postings and track their performance</p>
                    </div>
                    <button
                        onClick={() => navigate('/jobs/post')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Post New Job
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
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
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
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
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Applications</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <EyeIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex space-x-1">
                        {['all', 'active', 'inactive'].map((status) => (
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
                                        {jobs.filter(job =>
                                            status === 'active' ? job.isActive : !job.isActive
                                        ).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs List */}
                <div className="bg-white rounded-lg shadow-sm">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12">
                            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {filter === 'all' ? 'No job postings yet' : `No ${filter} job postings`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all'
                                    ? 'Start posting jobs to see them here.'
                                    : `You don't have any ${filter} job postings at the moment.`
                                }
                            </p>
                            {filter === 'all' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/jobs/post')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Post Your First Job
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredJobs.map((job) => (
                                <div key={job._id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {job.title}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.isActive)}`}>
                                                    {getStatusIcon(job.isActive)}
                                                    <span className="ml-2">{getStatusText(job.isActive)}</span>
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <BriefcaseIcon className="w-4 h-4 mr-2" />
                                                <span>{job.company}</span>
                                                <span className="mx-2">•</span>
                                                <MapPinIcon className="w-4 h-4 mr-2" />
                                                <span>{job.location}</span>
                                                <span className="mx-2">•</span>
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                {job.deadline && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <UsersIcon className="w-4 h-4 mr-2" />
                                                    <span>{job.applications || 0} applications</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <EyeIcon className="w-4 h-4 mr-2" />
                                                    <span>{job.views || 0} views</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-2" />
                                                    <span className="capitalize">{job.type}</span>
                                                </div>
                                            </div>

                                            {job.description && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {job.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/jobs/${job._id}`)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                View
                                            </button>

                                            <button
                                                onClick={() => navigate(`/jobs/edit/${job._id}`)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                <PencilIcon className="w-4 h-4 mr-2" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(job._id, job.isActive ? 'active' : 'inactive')}
                                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${job.isActive
                                                    ? 'text-red-700 bg-white hover:bg-red-50 border-red-300'
                                                    : 'text-green-700 bg-white hover:bg-green-50 border-green-300'
                                                    }`}
                                            >
                                                {job.isActive ? 'Deactivate' : 'Activate'}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteJob(job._id)}
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

export default MyPostings;
