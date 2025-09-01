import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints, qaSessionEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalViews: 0
    });
    const [qaSessions, setQaSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch jobs, stats, and QA sessions in parallel
            const [jobsResponse, statsResponse, qaSessionsResponse] = await Promise.all([
                jobEndpoints.getMyPostings(),
                jobEndpoints.getRecruiterStats(),
                qaSessionEndpoints.getRecruiterQASessions()
            ]);

            if (jobsResponse.data.success) {
                setJobs(jobsResponse.data.data.jobs || jobsResponse.data.data || []);
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

            if (qaSessionsResponse.data.success) {
                setQaSessions(qaSessionsResponse.data.data.sessions || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleJobStatus = async (jobId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await jobEndpoints.updateJob(jobId, { isActive: newStatus });

            if (response.data.success) {
                toast.success(`Job ${newStatus ? 'activated' : 'deactivated'} successfully`);

                // Update the job in local state
                setJobs(prevJobs =>
                    prevJobs.map(job =>
                        job._id === jobId
                            ? { ...job, isActive: newStatus }
                            : job
                    )
                );

                // Update stats
                setStats(prev => ({
                    ...prev,
                    activeJobs: newStatus ? prev.activeJobs + 1 : prev.activeJobs - 1
                }));
            }
        } catch (error) {
            console.error('Error toggling job status:', error);
            toast.error(error.response?.data?.message || 'Failed to update job status');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await jobEndpoints.deleteJob(jobId);

            if (response.data.success) {
                toast.success('Job deleted successfully');

                // Remove the job from local state
                setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));

                // Update stats
                setStats(prev => ({
                    ...prev,
                    totalJobs: prev.totalJobs - 1,
                    activeJobs: prev.activeJobs - 1
                }));
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error(error.response?.data?.message || 'Failed to delete job');
        }
    };

    const handleUpdateApplicantStatus = async (jobId, applicantId, newStatus) => {
        try {
            const response = await jobEndpoints.updateApplicantStatus(jobId, applicantId, {
                status: newStatus
            });

            if (response.data.success) {
                toast.success('Applicant status updated successfully');

                // Update the applicant status in local state
                setJobs(prevJobs =>
                    prevJobs.map(job =>
                        job._id === jobId
                            ? {
                                ...job,
                                applicants: job.applicants.map(applicant =>
                                    applicant._id === applicantId
                                        ? { ...applicant, status: newStatus }
                                        : applicant
                                )
                            }
                            : job
                    )
                );
            }
        } catch (error) {
            console.error('Error updating applicant status:', error);
            toast.error(error.response?.data?.message || 'Failed to update applicant status');
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'hired': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'applied': return 'Applied';
            case 'shortlisted': return 'Shortlisted';
            case 'rejected': return 'Rejected';
            case 'hired': return 'Hired';
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
                    <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, {user?.name}! Manage your job postings and track applications.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                        <span className="text-blue-600 text-lg">📋</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Jobs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.totalJobs}
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
                                            Active Jobs
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.activeJobs}
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
                                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                        <span className="text-purple-600 text-lg">👥</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Applications
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.totalApplications}
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
                                        <span className="text-yellow-600 text-lg">👁️</span>
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Views
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {stats.totalViews}
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
                            Manage your job postings and applications
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <Link to="/jobs/post">
                                <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 text-xl">➕</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-blue-900">Post New Job</h3>
                                            <p className="text-xs text-blue-700">Create a new job posting</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/jobs">
                                <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <span className="text-green-600 text-xl">🔍</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-green-900">Browse All Jobs</h3>
                                            <p className="text-xs text-green-700">View all job opportunities</p>
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
                                            <p className="text-xs text-purple-700">Keep your company info current</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/qa/create">
                                <div className="bg-orange-50 p-4 rounded-lg hover:bg-orange-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <span className="text-orange-600 text-xl">❓</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-orange-900">Create Q&A</h3>
                                            <p className="text-xs text-orange-700">Mock session for students</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/courses/create">
                                <div className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <span className="text-indigo-600 text-xl">📚</span>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-indigo-900">Create Course</h3>
                                            <p className="text-xs text-indigo-700">Offer 6-month courses</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>


                        </div>
                    </div>
                </div>

                {/* Job Postings */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">
                                    Your Job Postings ({jobs.length})
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage and monitor your job postings
                                </p>
                            </div>
                            <Link to="/jobs/post">
                                <Button variant="primary">
                                    Post New Job
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
                            <p className="text-gray-500">
                                Start posting jobs to attract talented candidates.
                            </p>
                            <div className="mt-4">
                                <Link to="/jobs/post">
                                    <Button variant="primary">
                                        Post Your First Job
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {jobs.map((job) => (
                                <div key={job._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {job.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {job.title}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Company:</span>
                                                    <p className="text-sm text-gray-900">{job.company}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Location:</span>
                                                    <p className="text-sm text-gray-900">{job.location}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Type:</span>
                                                    <p className="text-sm text-gray-900">{job.type}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Salary:</span>
                                                    <p className="text-sm text-gray-900">{formatSalary(job.salary)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Deadline:</span>
                                                    <p className={`text-sm ${getDeadlineColor(job.deadline)}`}>
                                                        {formatDeadline(job.deadline)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Applications:</span>
                                                    <p className="text-sm text-gray-900">{job.applicants?.length || 0}</p>
                                                </div>
                                            </div>

                                            {/* Recent Applicants */}
                                            {job.applicants && job.applicants.length > 0 && (
                                                <div className="mb-4">
                                                    <span className="text-sm font-medium text-gray-500">Recent Applicants:</span>
                                                    <div className="mt-2 space-y-2">
                                                        {job.applicants.slice(0, 3).map((applicant) => (
                                                            <div key={applicant._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                                <div className="flex items-center space-x-3">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(applicant.status)}`}>
                                                                        {getStatusText(applicant.status)}
                                                                    </span>
                                                                    <span className="text-sm text-gray-900">
                                                                        {applicant.userId?.name || 'Applicant Name'}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <select
                                                                    value={applicant.status}
                                                                    onChange={(e) => handleUpdateApplicantStatus(job._id, applicant._id, e.target.value)}
                                                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                                                >
                                                                    <option value="applied">Applied</option>
                                                                    <option value="shortlisted">Shortlisted</option>
                                                                    <option value="rejected">Rejected</option>
                                                                    <option value="hired">Hired</option>
                                                                </select>
                                                            </div>
                                                        ))}
                                                        {job.applicants.length > 3 && (
                                                            <p className="text-sm text-gray-500">
                                                                +{job.applicants.length - 3} more applicants
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-6 flex-shrink-0 space-y-2">
                                            <Link to={`/jobs/${job._id}`}>
                                                <Button variant="secondary" size="sm" className="w-full">
                                                    View Details
                                                </Button>
                                            </Link>

                                            <Button
                                                variant={job.isActive ? "outline" : "primary"}
                                                size="sm"
                                                onClick={() => handleToggleJobStatus(job._id, job.isActive)}
                                                className="w-full"
                                            >
                                                {job.isActive ? 'Deactivate' : 'Activate'}
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteJob(job._id)}
                                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Courses Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
                            <p className="text-gray-600">Create and manage your 6-month courses for students</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link to="/courses/create">
                                <Button variant="primary">
                                    Create New Course
                                </Button>
                            </Link>
                            <Link to="/courses">
                                <Button variant="outline">
                                    View All Courses
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center py-8">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start offering courses</h3>
                        <p className="text-gray-500">
                            Create 6-month courses to help students develop skills and advance their careers.
                        </p>
                        <div className="mt-4">
                            <Link to="/courses/create">
                                <Button variant="primary">
                                    Create Your First Course
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* QA Sessions Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Mock Question Sessions</h2>
                            <p className="text-gray-600">Manage mock interview questions for your job applications</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link to="/qa/create">
                                <Button variant="primary">
                                    Create New Session
                                </Button>
                            </Link>
                            <Link to="/qa">
                                <Button variant="outline">
                                    View All Sessions
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {qaSessions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No mock question sessions yet</h3>
                            <p className="text-gray-500">
                                Create mock interview questions to help evaluate candidates.
                            </p>
                            <div className="mt-4">
                                <Link to="/qa/create">
                                    <Button variant="primary">
                                        Create Your First Session
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {qaSessions.slice(0, 3).map((session) => (
                                <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {session.sessionTitle}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>{session.questions?.length || 0} questions</span>
                                                {session.jobId && (
                                                    <span className="text-blue-600">
                                                        Linked to: {session.jobId.title}
                                                    </span>
                                                )}
                                                <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link to={`/qa/${session._id}`}>
                                                <Button variant="secondary" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {qaSessions.length > 3 && (
                                <div className="text-center pt-4">
                                    <Link to="/qa">
                                        <Button variant="outline">
                                            View All {qaSessions.length} Sessions
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
