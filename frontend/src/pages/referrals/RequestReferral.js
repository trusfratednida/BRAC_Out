import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints, userEndpoints, referralEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const RequestReferral = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [alumni, setAlumni] = useState([]);
    const [formData, setFormData] = useState({
        jobId: '',
        alumniId: '',
        studentMessage: '',
        resume: null,
        coverLetter: null
    });

    useEffect(() => {
        fetchJobs();
        fetchAlumni();

        // Pre-select job if jobId is in URL params
        const jobIdFromUrl = searchParams.get('jobId');
        if (jobIdFromUrl) {
            setFormData(prev => ({ ...prev, jobId: jobIdFromUrl }));
        }
    }, [searchParams]);

    const fetchJobs = async () => {
        try {
            const response = await jobEndpoints.getJobs({ limit: 100, isActive: true });
            if (response.data.success) {
                setJobs(response.data.data.jobs || response.data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to fetch jobs');
        }
    };

    const fetchAlumni = async () => {
        try {
            const response = await userEndpoints.getAlumni();

            // Handle different response structures
            let alumniData = [];
            if (response.data?.success && response.data?.data) {
                alumniData = response.data.data.users || response.data.data;
            } else if (response.data?.data) {
                alumniData = response.data.data.users || response.data.data;
            } else if (Array.isArray(response.data)) {
                alumniData = response.data;
            }

            // Ensure we have an array and filter only verified alumni
            if (Array.isArray(alumniData)) {
                const verifiedAlumni = alumniData.filter(alumni => alumni.isVerified);
                setAlumni(verifiedAlumni);
            } else {
                setAlumni([]);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Please log in to view alumni');
            } else if (error.response?.status === 403) {
                toast.error('You are not authorized to view alumni');
            } else {
                toast.error('Failed to fetch alumni');
            }
            setAlumni([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${field === 'resume' ? 'Resume' : 'Cover letter'} size must be less than 5MB`);
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${field === 'resume' ? 'Resume' : 'Cover letter'} must be a PDF or Word document`);
                return;
            }

            setFormData(prev => ({
                ...prev,
                [field]: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.jobId || !formData.alumniId || !formData.studentMessage || !formData.resume) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const referralData = new FormData();
            referralData.append('jobId', formData.jobId);
            referralData.append('alumniId', formData.alumniId);
            referralData.append('studentMessage', formData.studentMessage);
            referralData.append('resume', formData.resume);

            if (formData.coverLetter) {
                referralData.append('coverLetter', formData.coverLetter);
            }

            const response = await referralEndpoints.requestReferral(referralData);

            if (response.data.success) {
                toast.success('Referral request submitted successfully!');
                navigate('/referrals/my-requests');
            }
        } catch (error) {
            console.error('Error submitting referral request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit referral request');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'Student') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">Only students can request referrals.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Request Referral</h1>
                    <p className="mt-2 text-gray-600">
                        Ask alumni for referrals to increase your chances of getting hired
                    </p>
                </div>

                {/* Referral Form */}
                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Job Selection */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Job *
                                </label>
                                <select
                                    name="jobId"
                                    value={formData.jobId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Choose a job...</option>
                                    {jobs.map((job) => (
                                        <option key={job._id} value={job._id}>
                                            {job.title} at {job.company} - {job.location}
                                        </option>
                                    ))}
                                </select>
                                {formData.jobId && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                        {(() => {
                                            const selectedJob = jobs.find(job => job._id === formData.jobId);
                                            return selectedJob ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{selectedJob.title}</p>
                                                    <p className="text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                                                    <p className="text-gray-500">{selectedJob.type}</p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Alumni Selection */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Alumni Selection</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose Alumni *
                                </label>
                                <select
                                    name="alumniId"
                                    value={formData.alumniId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select an alumni...</option>
                                    {alumni.map((alumniUser) => (
                                        <option key={alumniUser._id} value={alumniUser._id}>
                                            {alumniUser.name} - {alumniUser.profile?.jobTitle || 'N/A'} at {alumniUser.profile?.company || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                                {formData.alumniId && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                        {(() => {
                                            const selectedAlumni = alumni.find(a => a._id === formData.alumniId);
                                            return selectedAlumni ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{selectedAlumni.name}</p>
                                                    <p className="text-gray-600">
                                                        {selectedAlumni.profile?.jobTitle || 'N/A'} at {selectedAlumni.profile?.company || 'N/A'}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        Department: {selectedAlumni.profile?.department || 'N/A'} • Batch: {selectedAlumni.profile?.batch || 'N/A'}
                                                    </p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Message</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message to Alumni *
                                </label>
                                <textarea
                                    name="studentMessage"
                                    value={formData.studentMessage}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Introduce yourself, explain why you're interested in this position, and why you'd appreciate their referral. Be specific about your skills and experience..."
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    Write a compelling message explaining why you'd be a great fit for this role.
                                </p>
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resume *
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileChange(e, 'resume')}
                                        required
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        PDF or Word document. Max size 5MB.
                                    </p>
                                    {formData.resume && (
                                        <p className="mt-2 text-sm text-green-600">
                                            ✓ Selected: {formData.resume.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cover Letter (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileChange(e, 'coverLetter')}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        PDF or Word document. Max size 5MB.
                                    </p>
                                    {formData.coverLetter && (
                                        <p className="mt-2 text-sm text-green-600">
                                            ✓ Selected: {formData.coverLetter.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for a Successful Referral Request</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Personalize your message - mention why you chose this specific alumni</li>
                                <li>• Highlight relevant skills and experience that match the job requirements</li>
                                <li>• Keep your message professional but friendly</li>
                                <li>• Ensure your resume is up-to-date and tailored to the position</li>
                                <li>• Follow up politely if you don't hear back within a week</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/referrals/my-requests')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Submit Referral Request'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestReferral;
