import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobFAQEndpoints } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import {
    ChatBubbleLeftRightIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    BriefcaseIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const FAQ = () => {
    const { user } = useAuth();
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        tags: '',
        jobId: ''
    });

    useEffect(() => {
        loadFAQs();
        loadCategories();
    }, [selectedCategory, searchQuery]);

    const loadFAQs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const response = await jobFAQEndpoints.getAll(params);
            setFaqs(response.data?.data?.faqs || []);
        } catch (error) {
            console.error('Error loading FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await jobFAQEndpoints.getCategories();
            setCategories(response.data?.data?.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleCreateFAQ = async (e) => {
        e.preventDefault();

        if (!formData.question.trim() || !formData.answer.trim() || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const faqData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                ...(formData.jobId && { jobId: formData.jobId })
            };

            await jobFAQEndpoints.create(faqData);
            toast.success('FAQ created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadFAQs();
        } catch (error) {
            console.error('Error creating FAQ:', error);
            toast.error('Failed to create FAQ');
        }
    };

    const handleUpdateFAQ = async (e) => {
        e.preventDefault();

        if (!formData.question.trim() || !formData.answer.trim() || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const faqData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
            };

            await jobFAQEndpoints.update(editingFAQ._id, faqData);
            toast.success('FAQ updated successfully!');
            setShowEditModal(false);
            setEditingFAQ(null);
            resetForm();
            loadFAQs();
        } catch (error) {
            console.error('Error updating FAQ:', error);
            toast.error('Failed to update FAQ');
        }
    };

    const handleDeleteFAQ = async (faqId) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

        try {
            await jobFAQEndpoints.delete(faqId);
            toast.success('FAQ deleted successfully!');
            loadFAQs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Failed to delete FAQ');
        }
    };

    const handleMarkHelpful = async (faqId, isHelpful) => {
        try {
            await jobFAQEndpoints.markHelpful(faqId, { isHelpful });
            loadFAQs(); // Refresh to get updated counts
        } catch (error) {
            console.error('Error marking helpful:', error);
            toast.error('Failed to record feedback');
        }
    };

    const openEditModal = (faq) => {
        setEditingFAQ(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            tags: faq.tags?.join(', ') || '',
            jobId: faq.jobId?._id || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            question: '',
            answer: '',
            category: '',
            tags: '',
            jobId: ''
        });
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Application Process': '📝',
            'Job Requirements': '📋',
            'Company Culture': '🏢',
            'Interview Process': '🤝',
            'Benefits & Compensation': '💰',
            'Remote Work': '🏠',
            'Career Growth': '📈',
            'Other': '❓'
        };
        return icons[category] || '❓';
    };

    if (loading && faqs.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-text-primary mb-4">Jobs FAQ</h1>
                            <p className="text-xl text-text-secondary">
                                Find answers to common questions about jobs, applications, and career guidance
                            </p>
                        </div>
                        {user?.role === 'Recruiter' && (
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center space-x-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Create FAQ</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filter */}
                <Card padding="lg" className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <Input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-4 pl-12 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* FAQs List */}
                {faqs.length === 0 ? (
                    <Card padding="xl" className="text-center">
                        <div className="py-16">
                            <div className="mx-auto w-24 h-24 bg-background-100 rounded-full flex items-center justify-center mb-6">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-background-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">No FAQs found</h3>
                            <p className="text-text-secondary mb-8 max-w-md mx-auto">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Be the first to create a helpful FAQ entry!'
                                }
                            </p>
                            {user?.role === 'Recruiter' && (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Create First FAQ
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {faqs.map((faq) => (
                            <Card key={faq._id} padding="lg" hoverable>
                                <div className="space-y-4">
                                    {/* FAQ Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-600 text-lg">
                                                        {getCategoryIcon(faq.category)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                                        {faq.category}
                                                    </span>
                                                    {faq.jobId && (
                                                        <span className="px-3 py-1 bg-background-100 text-text-secondary rounded-full text-sm font-medium flex items-center space-x-1">
                                                            <BriefcaseIcon className="w-3 h-3" />
                                                            <span>{faq.jobId.company}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-text-primary mb-2">
                                                    {faq.question}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Action Buttons for Recruiters */}
                                        {user?.role === 'Recruiter' && faq.createdBy?._id === user._id && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openEditModal(faq)}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="error"
                                                    size="sm"
                                                    onClick={() => handleDeleteFAQ(faq._id)}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* FAQ Answer */}
                                    <div className="pl-14">
                                        <p className="text-text-secondary leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>

                                    {/* FAQ Footer */}
                                    <div className="pl-14 pt-4 border-t border-background-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-text-secondary">
                                                <div className="flex items-center space-x-2">
                                                    <UserIcon className="w-4 h-4" />
                                                    <span>{faq.createdBy?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>{faq.views || 0} views</span>
                                                </div>
                                            </div>

                                            {/* Helpful Buttons */}
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleMarkHelpful(faq._id, true)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <HandThumbUpIcon className="w-4 h-4" />
                                                    <span>{faq.helpfulCount || 0}</span>
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleMarkHelpful(faq._id, false)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <HandThumbDownIcon className="w-4 h-4" />
                                                    <span>{faq.notHelpfulCount || 0}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create FAQ Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New FAQ"
                size="2xl"
            >
                <form onSubmit={handleCreateFAQ} className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Question *
                        </label>
                        <Input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter your question..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Answer *
                        </label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            rows={6}
                            className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary placeholder-text-secondary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                            placeholder="Provide a detailed answer..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Tags (Optional)
                        </label>
                        <Input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Enter tags separated by commas (e.g., interview, remote, benefits)"
                        />
                        <p className="text-sm text-text-secondary mt-2">
                            Tags help users find relevant FAQs more easily
                        </p>
                    </div>

                    <div className="flex items-center space-x-4 pt-6 border-t border-background-200">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Create FAQ
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit FAQ Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit FAQ"
                size="2xl"
            >
                <form onSubmit={handleUpdateFAQ} className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Question *
                        </label>
                        <Input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter your question..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Answer *
                        </label>
                        <textarea
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            rows={6}
                            className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary placeholder-text-secondary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                            placeholder="Provide a detailed answer..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-text-primary mb-3">
                            Tags (Optional)
                        </label>
                        <Input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                            placeholder="Enter tags separated by commas (e.g., interview, remote, benefits)"
                        />
                    </div>

                    <div className="flex items-center space-x-4 pt-6 border-t border-background-200">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEditModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            Update FAQ
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FAQ;


