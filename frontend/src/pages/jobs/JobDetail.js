import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints, qaSessionEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MockQuestionsStatus from '../../components/jobs/MockQuestionsStatus';
import {
    BriefcaseIcon,
    MapPinIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    UsersIcon,
    TagIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [application, setApplication] = useState({
        coverLetter: '',
        resume: null
    });
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    const [mockQuestions, setMockQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showMockQuestions, setShowMockQuestions] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [retryDelay, setRetryDelay] = useState(0);

    useEffect(() => {
        fetchJobDetails();
        if (user?.role === 'Student') {
            fetchMockQuestions();
        }
    }, [id]);

    const fetchJobDetails = async (isRetry = false) => {
        try {
            setLoading(true);
            const response = await jobEndpoints.getJob(id);

            const jobData = response.data?.data?.job || response.data?.job || response.data;
            setJob(jobData);

            setRetryCount(0);
            setRetryDelay(0);

            if (user && user.role === 'Student') {
                const hasApplied = jobData?.applicants?.some(
                    applicant => applicant.userId === user._id
                );
                setHasApplied(hasApplied);
                if (hasApplied) {
                    const application = jobData.applicants.find(
                        applicant => applicant.userId === user._id
                    );
                    setApplicationStatus(application?.status || 'applied');
                }
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            if (error.response?.status === 429) {
                const retryAfter = error.response?.data?.retryAfter || 15;
                setRetryDelay(retryAfter);
                setRetryCount(prev => prev + 1);

                if (retryCount < 3) {
                    toast.error(`Too many requests. Retrying in ${retryAfter} seconds...`);
                    setTimeout(() => {
                        fetchJobDetails(true);
                    }, retryAfter * 1000);
                } else {
                    toast.error('Too many requests. Please wait a few minutes and try again.');
                }
            } else {
                toast.error('Failed to load job details');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMockQuestions = async () => {
        try {
            const response = await qaSessionEndpoints.getJobQASessions(id);
            const sessions = response.data?.data?.sessions || [];
            if (sessions.length > 0) {
                setMockQuestions(sessions[0].questions || []);
                setAnswers(new Array(sessions[0].questions?.length || 0).fill(''));
            }
        } catch (error) {
            console.error('Error fetching mock questions:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setApplication(prev => ({ ...prev, resume: file }));
        }
    };

    const handleApply = async () => {
        if (!application.coverLetter.trim()) {
            toast.error('Please provide a cover letter');
            return;
        }

        if (!application.resume) {
            toast.error('Please upload your resume');
            return;
        }

        if (mockQuestions.length > 0 && !showMockQuestions) {
            setShowMockQuestions(true);
            return;
        }

        if (mockQuestions.length > 0 && answers.some(answer => !answer.trim())) {
            toast.error('Please answer all mock questions');
            return;
        }

        try {
            setApplying(true);

            // Submit mock questions answers first if they exist
            if (mockQuestions.length > 0) {
                const qaSessionResponse = await qaSessionEndpoints.getJobQASessions(id);
                const sessions = qaSessionResponse.data?.data?.sessions || [];
                if (sessions.length > 0) {
                    await qaSessionEndpoints.submitAnswers(sessions[0]._id, { answers });
                }
            }

            // Submit job application
            const formData = new FormData();
            formData.append('coverLetter', application.coverLetter);
            formData.append('resume', application.resume);

            await jobEndpoints.applyForJob(id, formData);

            toast.success('Application submitted successfully!');
            setHasApplied(true);
            setApplicationStatus('applied');
            setShowMockQuestions(false);

            // Refresh job details to update application count
            fetchJobDetails();
        } catch (error) {
            console.error('Error applying for job:', error);
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const handleRequestReferral = () => {
        navigate(`/referrals/request?jobId=${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner size="xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-text-primary mb-4">Job Not Found</h1>
                        <p className="text-text-secondary mb-6">The job you're looking for doesn't exist or has been removed.</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/jobs')}
                        >
                            Back to Jobs
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'hired': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'applied': return <ClockIcon className="w-4 h-4" />;
            case 'shortlisted': return <CheckCircleIcon className="w-4 h-4" />;
            case 'rejected': return <XCircleIcon className="w-4 h-4" />;
            case 'hired': return <CheckCircleIcon className="w-4 h-4" />;
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <Card className="mb-8" padding="lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-text-primary mb-4">{job.title}</h1>
                            <div className="flex items-center text-text-secondary mb-6">
                                <BriefcaseIcon className="w-6 h-6 mr-3" />
                                <span className="text-xl font-semibold">{job.company}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center">
                                    <MapPinIcon className="w-5 h-5 mr-3 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Location</p>
                                        <p className="font-semibold text-text-primary">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-3 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Deadline</p>
                                        <p className="font-semibold text-text-primary">{new Date(job.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CurrencyDollarIcon className="w-5 h-5 mr-3 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-text-secondary">Salary Range</p>
                                        <p className="font-semibold text-text-primary">
                                            ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-6">
                            {user?.role === 'Recruiter' && job.postedBy === user._id && (
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(`/jobs/edit/${id}`)}
                                >
                                    Edit Job
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <Card padding="lg">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">Job Description</h2>
                            <div className="prose max-w-none">
                                <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{job.description}</p>
                            </div>
                        </Card>

                        {/* Requirements */}
                        <Card padding="lg">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">Requirements</h2>
                            <div className="space-y-6">
                                {job.requirements?.experience && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                                            <AcademicCapIcon className="w-5 h-5 mr-2 text-primary-600" />
                                            Experience
                                        </h3>
                                        <p className="text-text-secondary">{job.requirements.experience}</p>
                                    </div>
                                )}
                                {job.requirements?.education && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                                            <AcademicCapIcon className="w-5 h-5 mr-2 text-primary-600" />
                                            Education
                                        </h3>
                                        <p className="text-text-secondary">{job.requirements.education}</p>
                                    </div>
                                )}
                                {job.requirements?.skills && job.requirements.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                                            <TagIcon className="w-5 h-5 mr-2 text-primary-600" />
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requirements.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-sm font-medium border border-primary-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                            <Card padding="lg">
                                <h2 className="text-2xl font-bold text-text-primary mb-6">Tags</h2>
                                <div className="flex flex-wrap gap-3">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-background-100 text-text-secondary px-4 py-2 rounded-xl text-sm font-medium border border-background-200"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Application Section */}
                    <div className="space-y-6">
                        {/* Job Stats */}
                        <Card padding="lg">
                            <h3 className="text-xl font-bold text-text-primary mb-6">Job Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <EyeIcon className="w-5 h-5 mr-2 text-primary-600" />
                                        <span className="text-text-secondary">Views</span>
                                    </div>
                                    <span className="font-semibold text-text-primary">{job.views || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <UsersIcon className="w-5 h-5 mr-2 text-primary-600" />
                                        <span className="text-text-secondary">Applications</span>
                                    </div>
                                    <span className="font-semibold text-text-primary">{job.applications || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BriefcaseIcon className="w-5 h-5 mr-2 text-primary-600" />
                                        <span className="text-text-secondary">Type</span>
                                    </div>
                                    <span className="font-semibold text-text-primary capitalize">{job.type}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Mock Questions Section */}
                        {mockQuestions.length > 0 && showMockQuestions && (
                            <Card padding="lg">
                                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                                    <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-primary-600" />
                                    Mock Questions
                                </h3>
                                <p className="text-text-secondary mb-6">
                                    Please answer the following questions to complete your application:
                                </p>
                                <div className="space-y-6">
                                    {mockQuestions.map((question, index) => (
                                        <div key={index}>
                                            <label className="block text-lg font-semibold text-text-primary mb-3">
                                                Question {index + 1}:
                                            </label>
                                            <p className="text-text-secondary mb-3">{question}</p>
                                            <Input
                                                type="text"
                                                value={answers[index] || ''}
                                                onChange={(e) => {
                                                    const newAnswers = [...answers];
                                                    newAnswers[index] = e.target.value;
                                                    setAnswers(newAnswers);
                                                }}
                                                placeholder="Your answer..."
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Mock Questions Notice */}
                        {mockQuestions.length > 0 && !showMockQuestions && !hasApplied && (
                            <Card padding="lg" className="border-2 border-primary-200 bg-primary-50">
                                <div className="flex items-center mb-4">
                                    <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3 text-primary-600" />
                                    <h3 className="text-lg font-bold text-primary-800">Mock Questions Required</h3>
                                </div>
                                <p className="text-primary-700 mb-4">
                                    This job requires you to answer {mockQuestions.length} mock question{mockQuestions.length > 1 ? 's' : ''} as part of your application.
                                </p>
                                <p className="text-primary-600 text-sm">
                                    Click "Continue to Questions" below to proceed with your application.
                                </p>
                            </Card>
                        )}

                        {/* Application Form */}
                        {user?.role === 'Student' && (
                            <Card padding="lg">
                                <h3 className="text-xl font-bold text-text-primary mb-6">Apply for this Job</h3>

                                {!user.isVerified ? (
                                    <div className="text-center py-6">
                                        <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-yellow-100 text-yellow-800 border-yellow-200 mb-4">
                                            <ClockIcon className="w-4 h-4 mr-2" />
                                            <span>Account Pending Verification</span>
                                        </div>
                                        <p className="text-text-secondary mb-4">
                                            Your account needs to be verified by admin before you can apply for jobs.
                                        </p>
                                        <p className="text-text-secondary text-sm">
                                            Please wait for admin verification or contact support if you have any questions.
                                        </p>
                                    </div>
                                ) : hasApplied ? (
                                    <div className="text-center py-6">
                                        <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(applicationStatus)} mb-4`}>
                                            {getStatusIcon(applicationStatus)}
                                            <span className="ml-2 capitalize">{applicationStatus}</span>
                                        </div>

                                        {/* Status-specific messages */}
                                        {applicationStatus === 'applied' && (
                                            <p className="text-text-secondary mb-4">
                                                Your application is under review. The recruiter will contact you soon.
                                            </p>
                                        )}
                                        {applicationStatus === 'shortlisted' && (
                                            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-green-800 font-medium">🎉 Congratulations! You've been shortlisted!</p>
                                                <p className="text-green-700 text-sm mt-1">The recruiter will contact you for next steps.</p>
                                            </div>
                                        )}
                                        {applicationStatus === 'rejected' && (
                                            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-red-800 font-medium">Application Status Update</p>
                                                <p className="text-red-700 text-sm mt-1">Don't give up! Keep applying to other opportunities.</p>
                                            </div>
                                        )}
                                        {applicationStatus === 'hired' && (
                                            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-purple-800 font-medium">🎊 You've been hired!</p>
                                                <p className="text-purple-700 text-sm mt-1">Welcome to the team! The company will contact you with details.</p>
                                            </div>
                                        )}

                                        <p className="text-text-secondary mb-6">You have already applied for this position.</p>
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate('/jobs/my-applications')}
                                        >
                                            View My Applications
                                        </Button>

                                        {/* Show mock questions status if they exist */}
                                        {mockQuestions.length > 0 && (
                                            <div className="mt-6">
                                                <MockQuestionsStatus jobId={id} userId={user._id} />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} className="space-y-6">
                                        <div>
                                            <label className="block text-base font-semibold text-text-primary mb-3">
                                                Cover Letter *
                                            </label>
                                            <textarea
                                                value={application.coverLetter}
                                                onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
                                                rows={6}
                                                className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary placeholder-text-secondary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                                                placeholder="Explain why you're a great fit for this position..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-base font-semibold text-text-primary mb-3">
                                                Resume *
                                            </label>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                                className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                                                required
                                            />
                                            <p className="text-sm text-text-secondary mt-2">
                                                PDF, DOC, or DOCX files only. Max 5MB.
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={applying}
                                            className="w-full"
                                        >
                                            {applying ? 'Submitting...' :
                                                mockQuestions.length > 0 && !showMockQuestions ? 'Continue to Questions' :
                                                    'Submit Application'}
                                        </Button>
                                    </form>
                                )}

                                {/* Request Referral Option */}
                                <div className="mt-8 pt-6 border-t border-background-200">
                                    <h4 className="text-base font-semibold text-text-primary mb-4">Need a referral?</h4>
                                    <Button
                                        variant="outline"
                                        onClick={handleRequestReferral}
                                        className="w-full"
                                    >
                                        Request Alumni Referral
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Company Info */}
                        <Card padding="lg">
                            <h3 className="text-xl font-bold text-text-primary mb-4">About {job.company}</h3>
                            <p className="text-text-secondary leading-relaxed">
                                This company is looking for talented individuals to join their team.
                                Apply now to be part of their growing organization.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
