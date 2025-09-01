import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Jobs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        type: '',
        experience: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0
    });

    useEffect(() => {
        fetchJobs();
    }, [filters, pagination.currentPage]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 12,
                ...filters
            };

            const response = await jobEndpoints.getJobs(params);

            if (response.data.success) {
                setJobs(response.data.data.jobs || response.data.data);
                setPagination({
                    currentPage: response.data.data.pagination?.currentPage || 1,
                    totalPages: response.data.data.pagination?.totalPages || 1,
                    totalJobs: response.data.data.pagination?.totalJobs || response.data.data.length || 0
                });
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleApplyJob = async (jobId) => {
        if (!user) {
            toast.error('Please login to apply for jobs');
            navigate('/login');
            return;
        }

        if (user.role !== 'Student') {
            toast.error('Only students can apply for jobs');
            return;
        }

        if (!user.isVerified) {
            toast.error('Your account needs to be verified by admin before you can apply for jobs');
            return;
        }

        try {
            // Navigate to job detail page
            navigate(`/jobs/${jobId}`);
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error('Failed to apply for job');
        }
    };

    const handleRequestReferral = (jobId) => {
        if (!user) {
            toast.error('Please login to request referrals');
            navigate('/login');
            return;
        }

        if (user.role !== 'Student') {
            toast.error('Only students can request referrals');
            return;
        }

        if (!user.isVerified) {
            toast.error('Your account needs to be verified by admin before you can request referrals');
            return;
        }

        // Navigate to referral request page with job pre-selected
        navigate(`/referrals/request?jobId=${jobId}`);
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

    const formatDeadline = (deadline) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays <= 7) return `${diffDays} days left`;
        return date.toLocaleDateString();
    };

    const getDeadlineColor = (deadline) => {
        if (!deadline) return 'text-gray-500';
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600';
        if (diffDays <= 3) return 'text-red-600';
        if (diffDays <= 7) return 'text-yellow-600';
        return 'text-green-600';
    };

    if (loading && jobs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
                            <p className="mt-2 text-gray-600">
                                Find your next career opportunity from top companies
                            </p>
                        </div>
                        {user?.role === 'Recruiter' && (
                            <Link to="/jobs/post">
                                <Button variant="primary">
                                    Post New Job
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Jobs
                                </label>
                                <input
                                    type="text"
                                    placeholder="Job title, company, or keywords..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <select
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Locations</option>
                                    <option value="Remote">Remote</option>
                                    <option value="New York">New York</option>
                                    <option value="San Francisco">San Francisco</option>
                                    <option value="London">London</option>
                                    <option value="Bangalore">Bangalore</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Type
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Types</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Experience
                                </label>
                                <select
                                    value={filters.experience}
                                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Levels</option>
                                    <option value="Entry Level">Entry Level</option>
                                    <option value="Mid Level">Mid Level</option>
                                    <option value="Senior Level">Senior Level</option>
                                    <option value="Expert Level">Expert Level</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFilters({ search: '', location: '', type: '', experience: '' });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-500">
                            Try adjusting your filters or check back later for new opportunities.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {jobs.map((job) => (
                                <div key={job._id} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        {/* Job Header */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {job.title}
                                            </h3>
                                            <p className="text-gray-600 mb-2">{job.company}</p>
                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <span>📍 {job.location}</span>
                                                <span className="mx-2">•</span>
                                                <span>{job.type}</span>
                                            </div>
                                        </div>

                                        {/* Salary and Deadline */}
                                        <div className="mb-4 space-y-2">
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Salary: </span>
                                                <span className="text-gray-600">{formatSalary(job.salary)}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-700">Deadline: </span>
                                                <span className={`${getDeadlineColor(job.deadline)}`}>
                                                    {formatDeadline(job.deadline)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {job.requirements?.skills && job.requirements.skills.length > 0 && (
                                            <div className="mb-4">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Skills:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {job.requirements.skills.slice(0, 3).map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.requirements.skills.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                            +{job.requirements.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {job.tags && job.tags.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {job.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2">
                                            {user?.role === 'Student' && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApplyJob(job._id)}
                                                        className="flex-1"
                                                    >
                                                        Apply Now
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleRequestReferral(job._id)}
                                                        className="flex-1"
                                                    >
                                                        Request Referral
                                                    </Button>
                                                </>
                                            )}
                                            {user?.role === 'Recruiter' && job.postedBy === user._id && (
                                                <Link to={`/jobs/${job._id}/edit`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        Edit Job
                                                    </Button>
                                                </Link>
                                            )}
                                            {(!user || (user.role !== 'Student' && user.role !== 'Recruiter')) && (
                                                <Link to={`/jobs/${job._id}`} className="flex-1">
                                                    <Button variant="primary" size="sm" className="w-full">
                                                        View Details
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2 text-sm text-gray-700">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Jobs;
