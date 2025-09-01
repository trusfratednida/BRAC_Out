import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API instance for file uploads (registration)
export const authAPI = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth',
    headers: {
        'Content-Type': 'multipart/form-data', // For file uploads
    },
});

// Auth API instance for JSON requests (login, password reset)
export const authAPIJson = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authEndpoints = {
    login: (data) => {
        // Use the JSON API instance for login
        return authAPIJson.post('/login', data);
    },
    register: (data) => {
        // Use the multipart API instance for registration (file uploads)
        return authAPI.post('/register', data);
    },
    forgotPassword: (data) => {
        // Use the JSON API instance for password reset
        return authAPIJson.post('/forgot-password', data);
    },
    resetPassword: (data) => {
        // Use the JSON API instance for password reset
        return authAPIJson.post('/reset-password', data);
    },
    verifyEmail: (params) => {
        // Use the JSON API instance for email verification
        return authAPIJson.get('/verify-email', { params });
    },
    getCurrentUser: () => api.get('/auth/me'),
};

// User API endpoints
export const userEndpoints = {
    getProfile: (id) => api.get(`/users/profile/${id}`),
    updateProfile: (id, data) => api.put(`/users/profile/${id}`, data),
    uploadVerificationDocument: (id, documentType, file) => {
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('idCard', file);
        return api.post(`/users/${id}/upload-verification`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getStudentApplicationHistory: () => api.get('/users/student/application-history'),
    getVerifyRequests: () => api.get('/users/verify-requests'),
    verifyUser: (id) => api.post(`/users/verify/${id}`),
    getAlumni: () => api.get('/users/alumni'),
    getStudents: () => api.get('/users/students'),
    getRecruiters: () => api.get('/users/recruiters'),
    blockUser: (id, data) => api.patch(`/users/block/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    search: (q, limit) => api.get('/users/search', { params: { q, limit } }),
};

// Job API endpoints
export const jobEndpoints = {
    getJobs: (params) => api.get('/jobs', { params }),
    getJob: (id) => api.get(`/jobs/${id}`),
    createJob: (data) => api.post('/jobs', data),
    updateJob: (id, data) => api.put(`/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/jobs/${id}`),
    applyForJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
    getMyPostings: () => api.get('/jobs/my-postings'),
    getMyApplications: () => api.get('/jobs/my-applications'),
    getMyApplicationStatus: (jobId) => api.get(`/jobs/${jobId}/my-application`),
    updateApplicantStatus: (jobId, applicantId, data) => api.patch(`/jobs/${jobId}/applicant-status/${applicantId}`, data),
    getRecruiterStats: () => api.get('/jobs/recruiter/summary'),
};

// Referral API endpoints
export const referralEndpoints = {
    requestReferral: (data) => api.post('/referrals/request', data),
    getMyRequests: () => api.get('/referrals/my-requests'),
    getAlumniReferrals: () => api.get('/referrals/alumni'),
    getPendingReferrals: () => api.get('/referrals/alumni/pending'),
    approveReferral: (id, data) => api.patch(`/referrals/${id}/approve`, data),
    rejectReferral: (id, data) => api.patch(`/referrals/${id}/reject`, data),
    getReferral: (id) => api.get(`/referrals/${id}`),
    getJobReferrals: (jobId) => api.get(`/referrals/job/${jobId}`),
    markAsRead: (id) => api.patch(`/referrals/${id}/mark-read`),
    deleteReferral: (id) => api.delete(`/referrals/${id}`),
};

// Admin API endpoints
export const adminEndpoints = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getSpamMonitor: (params) => api.get('/admin/spam-monitor', { params }),
    blockUser: (id, data) => api.patch(`/admin/block-user/${id}`, data),
    updateSpamScore: (id, data) => api.patch(`/admin/update-spam-score/${id}`, data),
    getAllJobs: (params) => api.get('/admin/jobs', { params }),
    toggleJob: (id) => api.patch(`/admin/toggle-job/${id}`),
    getAllReferrals: (params) => api.get('/admin/referrals', { params }),
    deleteJob: (id) => api.delete(`/admin/delete-job/${id}`),
    deleteReferral: (id) => api.delete(`/admin/delete-referral/${id}`),
    // Alumni verification endpoints
    getPendingAlumniVerifications: (params) => api.get('/admin/alumni-verifications', { params }),
    verifyAlumniAccount: (alumniId, data) => api.patch(`/admin/verify-alumni/${alumniId}`, data),
    // Student verification endpoints
    getPendingStudentVerifications: (params) => api.get('/admin/student-verifications', { params }),
    verifyStudentAccount: (studentId, data) => api.patch(`/admin/verify-student/${studentId}`, data),
    // Recruiter verification endpoints
    getPendingRecruiterVerifications: (params) => api.get('/admin/recruiter-verifications', { params }),
    verifyRecruiterAccount: (recruiterId, data) => api.patch(`/admin/verify-recruiter/${recruiterId}`, data),
};

// Alerts API endpoints
export const alertEndpoints = {
    create: (data) => api.post('/alerts/create', data),
    list: () => api.get('/alerts'),
    markSeen: (id) => api.patch(`/alerts/${id}/mark-seen`),
};

// Messaging API endpoints
export const messageEndpoints = {
    send: (data) => api.post('/messages/send', data),
    inbox: () => api.get('/messages/inbox'),
    conversation: (userId) => api.get(`/messages/conversation/${userId}`),
};

// Q&A Sessions API endpoints
export const qaSessionEndpoints = {
    create: (data) => api.post('/qa-sessions/create', data),
    getById: (id) => api.get(`/qa-sessions/${id}`),
    markCompleted: (id) => api.patch(`/qa-sessions/${id}/mark-completed`),
    getStudentStatus: (id) => api.get(`/qa-sessions/student/${id}`),
    list: () => api.get('/qa-sessions'),
    submitAnswers: (id, data) => api.post(`/qa-sessions/${id}/answers`, data),
    getJobQASessions: (jobId) => api.get(`/qa-sessions/job/${jobId}`),
    getRecruiterQASessions: () => api.get('/qa-sessions/recruiter/sessions'),
};

// Job FAQ API endpoints
export const jobFAQEndpoints = {
    create: (data) => api.post('/job-faq', data),
    getAll: (params) => api.get('/job-faq', { params }),
    getById: (id) => api.get(`/job-faq/${id}`),
    update: (id, data) => api.put(`/job-faq/${id}`, data),
    delete: (id) => api.delete(`/job-faq/${id}`),
    markHelpful: (id, data) => api.post(`/job-faq/${id}/helpful`, data),
    getCategories: () => api.get('/job-faq/categories'),
    getRecruiterFAQs: () => api.get('/job-faq/recruiter/my-faqs'),
};

// Resume API endpoints
export const resumeEndpoints = {
    generate: () => api.post('/resume/generate'),
};

// Courses API endpoints
export const courseEndpoints = {
    list: (params) => api.get('/courses', { params }),
    get: (id) => api.get(`/courses/${id}`),
    enroll: (data) => api.post('/courses/enroll', data),
    create: (data) => api.post('/courses', data),
    delete: (id) => api.delete(`/courses/${id}`),
    getProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
    completeCheckpoint: (data) => api.post('/courses/complete-checkpoint', data),
};

// Connections API endpoints
export const connectionEndpoints = {
    request: (data) => api.post('/connections/request', data),
    approve: (id) => api.patch(`/connections/${id}/approve`),
    list: () => api.get('/connections'),
    incoming: () => api.get('/connections/incoming'),
    outgoing: () => api.get('/connections/outgoing'),
    status: (targetId) => api.get('/connections/status', { params: { targetId } }),
};

// File upload helper
export const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append(type, file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// API utility functions
export const apiUtils = {
    // Handle API errors
    handleError: (error) => {
        if (error.response) {
            // Server responded with error status
            return error.response.data.message || 'An error occurred';
        } else if (error.request) {
            // Request was made but no response received
            return 'Network error. Please check your connection.';
        } else {
            // Something else happened
            return error.message || 'An unexpected error occurred';
        }
    },

    // Create query string from object
    createQueryString: (params) => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                searchParams.append(key, params[key]);
            }
        });
        return searchParams.toString();
    },

    // Format date for API
    formatDate: (date) => {
        if (!date) return null;
        return new Date(date).toISOString();
    },

    // Parse API response
    parseResponse: (response) => {
        return response.data;
    },
};

// Export default api instance
export default api;
