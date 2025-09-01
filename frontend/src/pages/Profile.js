import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userEndpoints } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    GlobeAltIcon,
    CodeBracketIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    PlusIcon,
    TrashIcon,
    CalendarIcon,
    DocumentTextIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        batch: '',
        company: '',
        jobTitle: '',
        phone: '',
        linkedin: '',
        github: '',
        experience: [],
        skills: [],
        awards: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                department: user.profile?.department || '',
                batch: user.profile?.batch || '',
                company: user.profile?.company || '',
                jobTitle: user.profile?.jobTitle || '',
                phone: user.profile?.phone || '',
                linkedin: user.profile?.linkedin || '',
                github: user.profile?.github || '',
                experience: user.profile?.experience || [],
                skills: user.profile?.skills || [],
                awards: user.profile?.awards || []
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle experience array changes
    const handleExperienceChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
        }));
    };

    const removeExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    // Handle skills array changes
    const handleSkillChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.map((skill, i) => i === index ? value : skill)
        }));
    };

    const addSkill = () => {
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, '']
        }));
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    // Handle awards array changes
    const handleAwardChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            awards: prev.awards.map((award, i) =>
                i === index ? { ...award, [field]: value } : award
            )
        }));
    };

    const addAward = () => {
        setFormData(prev => ({
            ...prev,
            awards: [...prev.awards, { title: '', organization: '', year: '', description: '' }]
        }));
    };

    const removeAward = (index) => {
        setFormData(prev => ({
            ...prev,
            awards: prev.awards.filter((_, i) => i !== index)
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Photo size must be less than 5MB');
                return;
            }
            setProfilePhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = { ...formData };

            // Handle profile photo upload if selected
            if (profilePhoto) {
                const formDataPhoto = new FormData();
                formDataPhoto.append('photo', profilePhoto);
                // Note: You'll need to implement photo upload endpoint
                // await userEndpoints.uploadPhoto(formDataPhoto);
            }

            // Update profile
            const response = await userEndpoints.updateProfile(user._id, updateData);

            if (response.data.success) {
                // Update local user context
                updateUser(response.data.data.user);
                setIsEditing(false);
                setProfilePhoto(null);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfilePhoto(null);
        // Reset form data to original user data
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                department: user.profile?.department || '',
                batch: user.profile?.batch || '',
                company: user.profile?.company || '',
                jobTitle: user.profile?.jobTitle || '',
                phone: user.profile?.phone || '',
                linkedin: user.profile?.linkedin || '',
                github: user.profile?.github || '',
                experience: user.profile?.experience || [],
                skills: user.profile?.skills || [],
                awards: user.profile?.awards || []
            });
        }
    };

    const getStatusIcon = () => {
        if (user?.isBlocked) {
            return <XCircleIcon className="h-5 w-5 text-error-500" />;
        }
        if (user?.isVerified) {
            return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
        }
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
    };

    const getStatusColor = () => {
        if (user?.isBlocked) {
            return 'bg-error-50 text-error-700 border-error-200';
        }
        if (user?.isVerified) {
            return 'bg-success-50 text-success-700 border-success-200';
        }
        return 'bg-warning-50 text-warning-700 border-warning-200';
    };

    const getStatusText = () => {
        if (user?.isBlocked) {
            return 'Account Blocked';
        }
        if (user?.isVerified) {
            return 'Verified';
        }
        return 'Pending Verification';
    };

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-text-primary mb-4">
                        Your Profile
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Manage your account information and preferences to keep your profile up to date
                    </p>
                </div>

                {/* Profile Overview Card */}
                <Card className="mb-8" padding="lg">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {user.profile?.photo ? (
                                        <img
                                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${user.profile.photo}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-16 h-16 text-primary-600" />
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="absolute -bottom-2 -right-2">
                                        <label className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-600 transition-colors duration-200">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div>
                                    <h2 className="text-3xl font-bold text-text-primary mb-2">
                                        {user.name}
                                    </h2>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor()}`}>
                                            {getStatusIcon()}
                                            <span className="ml-2">{getStatusText()}</span>
                                        </span>
                                        <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                                            {user.role}
                                        </span>
                                    </div>
                                    {user.role === 'Alumni' && !user.isVerified && (
                                        <p className="text-sm text-warning-600 bg-warning-50 px-3 py-2 rounded-lg border border-warning-200">
                                            ⏳ ID card verification required for alumni access
                                        </p>
                                    )}
                                </div>

                                {!isEditing && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        ✏️ Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Profile Form */}
                <Card padding="lg">
                    {!isEditing && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Click the "Edit Profile" button above to make changes to your profile information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!isEditing}
                                    icon={<UserIcon className="h-5 w-5" />}
                                />

                                <Input
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled
                                    icon={<EnvelopeIcon className="h-5 w-5" />}
                                />

                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    icon={<PhoneIcon className="h-5 w-5" />}
                                />

                                <Input
                                    label="LinkedIn Profile"
                                    name="linkedin"
                                    type="url"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={formData.linkedin}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    icon={<GlobeAltIcon className="h-5 w-5" />}
                                />

                                <Input
                                    label="GitHub Profile"
                                    name="github"
                                    type="url"
                                    placeholder="https://github.com/yourusername"
                                    value={formData.github}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    icon={<CodeBracketIcon className="h-5 w-5" />}
                                />
                            </div>
                        </div>

                        {/* Role-specific Information */}
                        {(user.role === 'Student' || user.role === 'Alumni') && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                    Academic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Department"
                                        name="department"
                                        type="text"
                                        placeholder="e.g., Computer Science and Engineering"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!isEditing}
                                        icon={<AcademicCapIcon className="h-5 w-5" />}
                                    />

                                    <Input
                                        label="Batch"
                                        name="batch"
                                        type="text"
                                        placeholder="e.g., 2019-2023"
                                        value={formData.batch}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!isEditing}
                                        icon={<AcademicCapIcon className="h-5 w-5" />}
                                    />
                                </div>
                            </div>
                        )}

                        {user.role === 'Recruiter' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                    Professional Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Company Name"
                                        name="company"
                                        type="text"
                                        placeholder="Enter your company name"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!isEditing}
                                        icon={<BuildingOfficeIcon className="h-5 w-5" />}
                                    />

                                    <Input
                                        label="Job Title"
                                        name="jobTitle"
                                        type="text"
                                        placeholder="e.g., HR Manager, Recruiter"
                                        value={formData.jobTitle}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!isEditing}
                                        icon={<BriefcaseIcon className="h-5 w-5" />}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {user.role === 'Student' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                    Experience
                                </h3>
                                <div className="space-y-4">
                                    {formData.experience.map((exp, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <Input
                                                label={`Experience ${index + 1} Title`}
                                                name={`experience.${index}.title`}
                                                type="text"
                                                placeholder="e.g., Software Engineer"
                                                value={exp.title}
                                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                                icon={<BriefcaseIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Experience ${index + 1} Company`}
                                                name={`experience.${index}.company`}
                                                type="text"
                                                placeholder="e.g., Tech Corp"
                                                value={exp.company}
                                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                icon={<BuildingOfficeIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Experience ${index + 1} Duration`}
                                                name={`experience.${index}.duration`}
                                                type="text"
                                                placeholder="e.g., 2020 - 2023"
                                                value={exp.duration}
                                                onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                icon={<CalendarIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Experience ${index + 1} Description`}
                                                name={`experience.${index}.description`}
                                                type="text"
                                                placeholder="e.g., Worked on frontend development"
                                                value={exp.description}
                                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                icon={<DocumentTextIcon className="h-5 w-5" />}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExperience(index)}
                                                className="col-span-1 md:col-span-1 flex items-center justify-center w-10 h-10 text-red-500 hover:bg-red-100 rounded-full focus:outline-none"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={addExperience}
                                        className="rounded-xl"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" /> Add Experience
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {user.role === 'Student' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                    Skills
                                </h3>
                                <div className="space-y-4">
                                    {formData.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <Input
                                                    label={`Skill ${index + 1}`}
                                                    name={`skill-${index}`}
                                                    type="text"
                                                    placeholder="e.g., React, Node.js, Python"
                                                    value={skill}
                                                    onChange={(e) => handleSkillChange(index, e.target.value)}
                                                    icon={<CodeBracketIcon className="h-5 w-5" />}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                className="flex items-center justify-center w-10 h-10 text-red-500 hover:bg-red-100 rounded-full focus:outline-none"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={addSkill}
                                        className="rounded-xl"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" /> Add Skill
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Awards */}
                        {user.role === 'Student' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text-primary border-b border-background-200 pb-4">
                                    Awards
                                </h3>
                                <div className="space-y-4">
                                    {formData.awards.map((award, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <Input
                                                label={`Award ${index + 1} Title`}
                                                name={`awards.${index}.title`}
                                                type="text"
                                                placeholder="e.g., Best Student Award"
                                                value={award.title}
                                                onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                                                icon={<TrophyIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Award ${index + 1} Organization`}
                                                name={`awards.${index}.organization`}
                                                type="text"
                                                placeholder="e.g., University of Tech"
                                                value={award.organization}
                                                onChange={(e) => handleAwardChange(index, 'organization', e.target.value)}
                                                icon={<BuildingOfficeIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Award ${index + 1} Year`}
                                                name={`awards.${index}.year`}
                                                type="text"
                                                placeholder="e.g., 2023"
                                                value={award.year}
                                                onChange={(e) => handleAwardChange(index, 'year', e.target.value)}
                                                icon={<CalendarIcon className="h-5 w-5" />}
                                            />
                                            <Input
                                                label={`Award ${index + 1} Description`}
                                                name={`awards.${index}.description`}
                                                type="text"
                                                placeholder="e.g., For academic excellence"
                                                value={award.description}
                                                onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                                                icon={<DocumentTextIcon className="h-5 w-5" />}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAward(index)}
                                                className="col-span-1 md:col-span-1 flex items-center justify-center w-10 h-10 text-red-500 hover:bg-red-100 rounded-full focus:outline-none"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={addAward}
                                        className="rounded-xl"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" /> Add Award
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-background-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={handleCancel}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={loading}
                                    disabled={loading}
                                    className="rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {loading ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
