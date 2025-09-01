import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminEndpoints, courseEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        totalReferrals: 0,
        pendingVerifications: 0,
        highSpamUsers: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentReferrals, setRecentReferrals] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashboardResponse, usersResponse, jobsResponse, referralsResponse, coursesResponse] = await Promise.all([
                adminEndpoints.getDashboard(),
                adminEndpoints.getUsers({ limit: 5 }),
                adminEndpoints.getAllJobs({ limit: 5 }),
                adminEndpoints.getAllReferrals({ limit: 5 }),
                courseEndpoints.list()
            ]);

            // Extract dashboard stats and recent data
            if (dashboardResponse.data?.success) {
                setStats(dashboardResponse.data?.data?.stats || {});
                setRecentUsers(dashboardResponse.data?.data?.recentUsers || []);
                setRecentJobs(dashboardResponse.data?.data?.recentJobs || []);
                setRecentReferrals(dashboardResponse.data?.data?.recentReferrals || []);
            }

            // Extract users data - fallback to dashboard data if individual endpoint fails
            if (usersResponse.data?.success) {
                setRecentUsers(usersResponse.data?.data?.users || usersResponse.data?.users || []);
            } else if (dashboardResponse.data?.data?.recentUsers) {
                setRecentUsers(dashboardResponse.data.data.recentUsers);
            }

            // Extract jobs data - fallback to dashboard data if individual endpoint fails
            if (jobsResponse.data?.success) {
                setRecentJobs(jobsResponse.data?.data?.jobs || jobsResponse.data?.jobs || []);
            } else if (dashboardResponse.data?.data?.recentJobs) {
                setRecentJobs(dashboardResponse.data.data.recentJobs);
            }

            // Extract referrals data - fallback to dashboard data if individual endpoint fails
            if (referralsResponse.data?.success) {
                setRecentReferrals(referralsResponse.data?.data?.referrals || referralsResponse.data?.referrals || []);
            } else if (dashboardResponse.data?.data?.recentReferrals) {
                setRecentReferrals(dashboardResponse.data.data.recentReferrals);
            }

            // Extract courses data
            if (coursesResponse.data?.success) {
                setCourses(coursesResponse.data?.data?.courses || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            await courseEndpoints.delete(courseId);
            toast.success('Course deleted successfully');

            // Remove the course from the local state
            setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading admin dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600">
                            Welcome back, {user?.name}! Here's an overview of the platform.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </>
                        )}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Users</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalReferrals}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                                <Link to="/admin/alumni-verifications" className="block">
                                    <p className="text-2xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                        {stats.pendingVerifications}
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">High Spam Users</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.highSpamUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <Link to="/admin/users">
                                <Button variant="primary" className="w-full">
                                    Manage Users
                                </Button>
                            </Link>
                            <Link to="/admin/alumni-verifications">
                                <Button variant="secondary" className="w-full">
                                    Alumni Verifications
                                </Button>
                            </Link>
                            <Link to="/admin/student-verifications">
                                <Button variant="secondary" className="w-full">
                                    Student Verifications
                                </Button>
                            </Link>
                            <Link to="/admin/recruiter-verifications">
                                <Button variant="secondary" className="w-full">
                                    Recruiter Verifications
                                </Button>
                            </Link>
                            <Link to="/admin/spam-monitor">
                                <Button variant="warning" className="w-full">
                                    Spam Monitor
                                </Button>
                            </Link>
                            <Link to="/admin/jobs">
                                <Button variant="outline" className="w-full">
                                    Manage Jobs
                                </Button>
                            </Link>
                            <Link to="/courses">
                                <Button variant="outline" className="w-full">
                                    Manage Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
                        <Link to="/admin/users" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="p-6">
                        {recentUsers.length > 0 ? (
                            <div className="space-y-4">
                                {recentUsers.map((user) => (
                                    <div key={user._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={user.profile?.photo || '/default-avatar.png'}
                                                        alt={user.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                                    <p className="text-gray-600">{user.email}</p>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                                                            user.role === 'Alumni' ? 'bg-green-100 text-green-800' :
                                                                user.role === 'Recruiter' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                        {user.isVerified ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/admin/users/${user._id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent users</h3>
                                <p className="text-gray-500">
                                    {isLoading ? 'Loading users...' : 'No users have been created yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Management */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Course Management</h2>
                        <Link to="/courses" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="p-6">
                        {courses.length > 0 ? (
                            <div className="space-y-4">
                                {courses.map((course) => (
                                    <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">{course.courseName}</h3>
                                                <p className="text-gray-600">{course.description || 'No description'}</p>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Duration: {course.duration}</span>
                                                    <span>•</span>
                                                    <span>{course.studentsEnrolled?.length || 0} students enrolled</span>
                                                    <span>•</span>
                                                    <span>Posted by: {course.postedBy?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {course.postedBy?.role || 'Unknown Role'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link to={`/courses/${course._id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
                                <p className="text-gray-500">
                                    No courses have been created yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Recent Job Postings</h2>
                        <Link to="/admin/jobs" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="p-6">
                        {recentJobs.length > 0 ? (
                            <div className="space-y-4">
                                {recentJobs.map((job) => (
                                    <div key={job._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                                                <p className="text-gray-600">{job.company}</p>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>{job.location}</span>
                                                    <span>•</span>
                                                    <span>{job.type}</span>
                                                    <span>•</span>
                                                    <span>{job.applications?.length || 0} applications</span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {job.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link to={`/admin/jobs/${job._id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent jobs</h3>
                                <p className="text-gray-500">
                                    {isLoading ? 'Loading jobs...' : 'No jobs have been posted yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Referrals */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Recent Referrals</h2>
                        <Link to="/admin/referrals" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                            View all
                        </Link>
                    </div>
                    <div className="p-6">
                        {recentReferrals.length > 0 ? (
                            <div className="space-y-4">
                                {recentReferrals.map((referral) => (
                                    <div key={referral._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {referral.jobId?.title || 'Job Title'}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {referral.studentId?.name || 'Student'} → {referral.alumniId?.name || 'Alumni'}
                                                </p>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        referral.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link to={`/admin/referrals/${referral._id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent referrals</h3>
                                <p className="text-gray-500">
                                    {isLoading ? 'Loading referrals...' : 'No referral requests have been made yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
