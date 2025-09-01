import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const PostJob = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company: '',
        location: '',
        type: 'Full-time',
        minSalary: '',
        maxSalary: '',
        experience: '',
        education: '',
        skills: '',
        tags: '',
        deadline: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.minSalary || !formData.maxSalary) {
            toast.error('Both minimum and maximum salary are required');
            return;
        }

        if (parseInt(formData.minSalary) >= parseInt(formData.maxSalary)) {
            toast.error('Minimum salary must be less than maximum salary');
            return;
        }

        if (!formData.deadline || new Date(formData.deadline) <= new Date()) {
            toast.error('Deadline must be a future date');
            return;
        }

        // Additional validation for required fields
        if (!formData.title || !formData.company || !formData.location || !formData.type || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const jobData = {
                ...formData,
                salary: {
                    min: parseInt(formData.minSalary),
                    max: parseInt(formData.maxSalary),
                    currency: 'USD'
                },
                skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                requirements: {
                    experience: formData.experience,
                    education: formData.education,
                    skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
                }
            };

            // Remove the flat salary fields to avoid confusion
            delete jobData.minSalary;
            delete jobData.maxSalary;

            // Debug: Log the data being sent
            

            const response = await jobEndpoints.createJob(jobData);

            if (response.data.success) {
                toast.success('Job posted successfully!');
                navigate('/jobs/my-postings');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'Recruiter') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600">Only recruiters can post jobs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Post New Job</h1>
                    <p className="mt-2 text-gray-600">
                        Create a new job posting to attract talented candidates
                    </p>
                </div>

                {/* Job Form */}
                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="Job Title *"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Software Engineer"
                                />

                                <Input
                                    label="Company *"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Tech Corp"
                                />

                                <Input
                                    label="Location *"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., New York, NY or Remote"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Salary Range */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Range</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="Minimum Salary *"
                                    name="minSalary"
                                    type="number"
                                    value={formData.minSalary}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 50000"
                                    min="0"
                                />

                                <Input
                                    label="Maximum Salary *"
                                    name="maxSalary"
                                    type="number"
                                    value={formData.maxSalary}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 80000"
                                    min="0"
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter annual salary in USD
                            </p>
                        </div>

                        {/* Requirements */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="Experience Level"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2-5 years or Entry level"
                                />

                                <Input
                                    label="Education"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Bachelor's degree or equivalent"
                                />
                            </div>
                        </div>

                        {/* Skills and Tags */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills & Tags</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Required Skills"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                                    helpText="Separate multiple skills with commas"
                                />

                                <Input
                                    label="Job Tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., remote, frontend, startup (comma-separated)"
                                    helpText="Separate multiple tags with commas"
                                />
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Provide a detailed description of the job, responsibilities, and what you're looking for in a candidate..."
                                />
                            </div>
                        </div>

                        {/* Application Deadline */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="Application Deadline *"
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Set a deadline for when applications will close
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/jobs/my-postings')}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="sm" /> : 'Post Job'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJob;
