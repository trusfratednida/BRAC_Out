import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    BriefcaseIcon,
    MapPinIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const MyApplications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await jobEndpoints.getMyApplications();
            // Ensure we get an array from the response
            const applicationsData = response.data?.data?.applications || response.data?.applications || response.data || [];
            setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'hired': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'applied': return <ClockIcon className="w-4 h-4" />;
            case 'shortlisted': return <CheckCircleIcon className="w-4 h-4" />;
            case 'rejected': return <XCircleIcon className="w-4 h-4" />;
            case 'hired': return <CheckCircleIcon className="w-4 h-4" />;
            case 'withdrawn': return <XCircleIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'applied': return 'Applied';
            case 'shortlisted': return 'Shortlisted';
            case 'rejected': return 'Rejected';
            case 'hired': return 'Accepted';
            case 'withdrawn': return 'Withdrawn';
            default: return 'Unknown';
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const getStats = () => {
        const total = applications.length;
        const applied = applications.filter(app => app.status === 'applied').length;
        const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;
        const hired = applications.filter(app => app.status === 'hired').length;

        return { total, applied, shortlisted, rejected, hired };
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Applications</h1>
                    <p className="text-gray-600">Track your job applications and their current status</p>
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
                                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.applied}</p>
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
                                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.shortlisted}</p>
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

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Hired</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.hired}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex space-x-1">
                        {['all', 'applied', 'shortlisted', 'rejected', 'hired'].map((status) => (
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
                                        {applications.filter(app => app.status === status).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white rounded-lg shadow-sm">
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'all'
                                    ? 'Start applying to jobs to see your applications here.'
                                    : `You don't have any ${filter} applications at the moment.`
                                }
                            </p>
                            {filter === 'all' && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/jobs')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Browse Jobs
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredApplications.map((application) => (
                                <div key={application.jobId} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {application.jobTitle}
                                                </h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                                    {getStatusIcon(application.status)}
                                                    <span className="ml-2">{getStatusText(application.status)}</span>
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                <BriefcaseIcon className="w-4 h-4 mr-2" />
                                                <span>{application.company}</span>
                                                <span className="mx-2">•</span>
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                                            </div>

                                            {application.coverLetter && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Cover Letter:</span> {application.coverLetter}
                                                    </p>
                                                </div>
                                            )}

                                            {application.resume && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Resume:</span> {application.resume}
                                                    </p>
                                                </div>
                                            )}

                                            {application.status === 'shortlisted' && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-800 font-medium">
                                                        🎉 Congratulations! You've been shortlisted for this position.
                                                    </p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        The recruiter will contact you soon for next steps.
                                                    </p>
                                                </div>
                                            )}

                                            {application.status === 'rejected' && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm text-red-800 font-medium">
                                                        Application Status Update
                                                    </p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Unfortunately, your application was not selected for this position.
                                                        Don't give up - keep applying to other opportunities!
                                                    </p>
                                                </div>
                                            )}

                                            {application.status === 'hired' && (
                                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <p className="text-sm text-purple-800 font-medium">
                                                        🎊 You've been hired!
                                                    </p>
                                                    <p className="text-sm text-purple-700 mt-1">
                                                        Welcome to the team! The company will contact you with onboarding details.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/jobs/${application.jobId}`)}
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

export default MyApplications;
