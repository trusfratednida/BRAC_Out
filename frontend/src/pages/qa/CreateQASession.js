import React, { useState, useEffect } from 'react';
import { qaSessionEndpoints, jobEndpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    ChatBubbleLeftRightIcon,
    PlusIcon,
    TrashIcon,
    BriefcaseIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const CreateQASession = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState(['']);
    const [jobId, setJobId] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        if (user?.role === 'Recruiter') {
            fetchRecruiterJobs();
        }
    }, [user]);

    const fetchRecruiterJobs = async () => {
        try {
            setLoadingJobs(true);
            const response = await jobEndpoints.getMyPostings();
            const jobsData = response.data?.data?.jobs || response.data?.jobs || [];
            setJobs(jobsData);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load your job postings');
        } finally {
            setLoadingJobs(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, '']);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const updateQuestion = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Please provide a session title');
            return;
        }

        const validQuestions = questions.filter(q => q.trim());
        if (validQuestions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        try {
            setLoading(true);
            const sessionData = {
                sessionTitle: title.trim(),
                questions: validQuestions,
                ...(jobId && { jobId })
            };

            await qaSessionEndpoints.create(sessionData);
            toast.success('Mock question session created successfully!');

            // Reset form
            setTitle('');
            setQuestions(['']);
            setJobId('');
        } catch (error) {
            console.error('Error creating session:', error);
            toast.error('Failed to create session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingJobs) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner size="xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-text-primary mb-4">Create Mock Question Session</h1>
                    <p className="text-xl text-text-secondary">
                        Create a set of questions that students must answer when applying for jobs
                    </p>
                </div>

                <Card padding="xl">
                    <form onSubmit={submit} className="space-y-8">
                        {/* Session Title */}
                        <div>
                            <label className="block text-lg font-semibold text-text-primary mb-3">
                                Session Title *
                            </label>
                            <Input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Frontend Developer Assessment, Data Science Quiz"
                                required
                                className="text-lg"
                            />
                            <p className="text-sm text-text-secondary mt-2">
                                Give your session a descriptive name that reflects the type of questions
                            </p>
                        </div>

                        {/* Job Selection */}
                        {jobs.length > 0 && (
                            <div>
                                <label className="block text-lg font-semibold text-text-primary mb-3">
                                    Link to Job (Optional)
                                </label>
                                <div className="relative">
                                    <select
                                        value={jobId}
                                        onChange={(e) => setJobId(e.target.value)}
                                        className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                                    >
                                        <option value="">Select a job to link this session to</option>
                                        {jobs.map((job) => (
                                            <option key={job._id} value={job._id}>
                                                {job.title} at {job.company}
                                            </option>
                                        ))}
                                    </select>
                                    <BriefcaseIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                </div>
                                <p className="text-sm text-text-secondary mt-2">
                                    Linking to a job will automatically show these questions to students applying for that position
                                </p>
                            </div>
                        )}

                        {/* Questions Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <label className="block text-lg font-semibold text-text-primary">
                                    Questions *
                                </label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={addQuestion}
                                    className="flex items-center space-x-2"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Add Question</span>
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-3">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <QuestionMarkCircleIcon className="w-5 h-5 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                value={question}
                                                onChange={(e) => updateQuestion(index, e.target.value)}
                                                placeholder={`Question ${index + 1}...`}
                                                required
                                            />
                                        </div>
                                        {questions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="error"
                                                size="sm"
                                                onClick={() => removeQuestion(index)}
                                                className="flex-shrink-0 mt-3"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-text-secondary mt-4">
                                Students will be required to answer all questions when applying for jobs linked to this session
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-background-200">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <LoadingSpinner size="sm" />
                                        <span>Creating Session...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        <span>Create Mock Question Session</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Info Section */}
                <Card padding="lg" className="mt-8">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-text-primary mb-3">
                            How Mock Questions Work
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-secondary">
                            <div>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-primary-600 text-xl">1</span>
                                </div>
                                <p>Create questions that test candidates' knowledge and skills</p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-primary-600 text-xl">2</span>
                                </div>
                                <p>Link questions to specific job postings</p>
                            </div>
                            <div>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-primary-600 text-xl">3</span>
                                </div>
                                <p>Students answer questions when applying for jobs</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CreateQASession;



