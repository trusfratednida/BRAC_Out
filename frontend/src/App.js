import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import LandingPage from './pages/LandingPage';
import FAQ from './pages/FAQ';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AlumniDashboard from './pages/dashboard/AlumniDashboard';
import RecruiterDashboard from './pages/dashboard/RecruiterDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Protected Pages
import Profile from './pages/Profile';
import Jobs from './pages/jobs/Jobs';
import JobDetail from './pages/jobs/JobDetail';
import PostJob from './pages/jobs/PostJob';
import MyApplications from './pages/jobs/MyApplications';
import MyPostings from './pages/jobs/MyPostings';
import RequestReferral from './pages/referrals/RequestReferral';
import ReferralsOverview from './pages/referrals/ReferralsOverview';
import MyReferrals from './pages/referrals/MyReferrals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminAlumniVerifications from './pages/admin/AdminAlumniVerifications';
import AdminStudentVerifications from './pages/admin/AdminStudentVerifications';
import AdminRecruiterVerifications from './pages/admin/AdminRecruiterVerifications';
import AdminSpamMonitor from './pages/admin/AdminSpamMonitor';
import Alerts from './pages/alerts/Alerts';
import Inbox from './pages/messages/Inbox';
import Conversation from './pages/messages/Conversation';
import CreateQASession from './pages/qa/CreateQASession';
import QASessionDetail from './pages/qa/QASessionDetail';
import StudentQAStatus from './pages/qa/StudentQAStatus';
import QASessionsList from './pages/qa/QASessionsList';
import ResumeBuilder from './pages/resume/ResumeBuilder';
import Course from './pages/courses/Course';
import CoursesList from './pages/courses/CoursesList';
import CourseDetail from './pages/courses/CourseDetail';
import CreateCourse from './pages/courses/CreateCourse';
import Connections from './pages/connections/Connections';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Main App Component
const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                {user?.role === 'Admin' ? <AdminDashboard /> :
                                    user?.role === 'Alumni' ? <AlumniDashboard /> :
                                        user?.role === 'Recruiter' ? <RecruiterDashboard /> :
                                            <StudentDashboard />}
                            </ProtectedRoute>
                        }
                    />

                    {/* Jobs Routes */}
                    <Route path="/jobs" element={<Jobs />} />
                    <Route
                        path="/jobs/:id"
                        element={<JobDetail />}
                    />
                    <Route
                        path="/jobs/post"
                        element={
                            <ProtectedRoute allowedRoles={['Recruiter']}>
                                <PostJob />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/jobs/my-applications"
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <MyApplications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/jobs/my-postings"
                        element={
                            <ProtectedRoute allowedRoles={['Recruiter']}>
                                <MyPostings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Referrals Routes */}
                    <Route
                        path="/referrals"
                        element={
                            <ProtectedRoute allowedRoles={['Student', 'Alumni']}>
                                <ReferralsOverview />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/referrals/request"
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <RequestReferral />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/referrals/my-requests"
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <MyReferrals />
                            </ProtectedRoute>
                        }
                    />

                    {/* Profile Route */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Alerts */}
                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <Alerts />
                            </ProtectedRoute>
                        }
                    />

                    {/* Messages */}
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <Inbox />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages/conversation/:id"
                        element={
                            <ProtectedRoute>
                                <Conversation />
                            </ProtectedRoute>
                        }
                    />

                    {/* Q&A Sessions */}
                    <Route
                        path="/qa"
                        element={
                            <ProtectedRoute>
                                <QASessionsList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/qa/create"
                        element={
                            <ProtectedRoute allowedRoles={['Recruiter']}>
                                <CreateQASession />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/qa/:id"
                        element={
                            <ProtectedRoute>
                                <QASessionDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/qa/student/:id"
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <StudentQAStatus />
                            </ProtectedRoute>
                        }
                    />

                    {/* Resume */}
                    <Route
                        path="/resume"
                        element={
                            <ProtectedRoute>
                                <ResumeBuilder />
                            </ProtectedRoute>
                        }
                    />

                    {/* Course */}
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <CoursesList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses/:id"
                        element={
                            <ProtectedRoute>
                                <CourseDetail />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/courses/create"
                        element={
                            <ProtectedRoute allowedRoles={['Recruiter']}>
                                <CreateCourse />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/course"
                        element={
                            <ProtectedRoute>
                                <Course />
                            </ProtectedRoute>
                        }
                    />

                    {/* Connections */}
                    <Route
                        path="/connections"
                        element={
                            <ProtectedRoute>
                                <Connections />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/jobs"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminJobs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/referrals"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminReferrals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/alumni-verifications"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminAlumniVerifications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/student-verifications"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminStudentVerifications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/recruiter-verifications"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminRecruiterVerifications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/spam-monitor"
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminSpamMonitor />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

// App Component with Auth Provider
const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
