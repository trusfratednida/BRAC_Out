import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { qaSessionEndpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    ChatBubbleLeftRightIcon,
    BriefcaseIcon,
    CalendarIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const QASessionsList = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                let res;

                if (user?.role === 'Recruiter') {
                    // For recruiters, get their own sessions
                    res = await qaSessionEndpoints.getRecruiterQASessions();
                } else {
                    // For students, get all sessions
                    res = await qaSessionEndpoints.list();
                }

                const sessionsData = res.data?.data?.sessions || [];
                setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            } catch (e) {
                toast.error('Failed to load sessions');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-text-primary mb-4">Mock Question Sessions</h1>
                            <p className="text-xl text-text-secondary">
                                {user?.role === 'Recruiter'
                                    ? 'Manage your mock question sessions for job applications'
                                    : 'Browse available mock question sessions'
                                }
                            </p>
                        </div>
                        {user?.role === 'Recruiter' && (
                            <Link to="/qa/create">
                                <Button variant="primary" size="lg" className="flex items-center space-x-2">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Create Session</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {sessions.length === 0 ? (
                    <Card padding="xl" className="text-center">
                        <div className="py-16">
                            <div className="mx-auto w-24 h-24 bg-background-100 rounded-full flex items-center justify-center mb-6">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-background-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">
                                {user?.role === 'Recruiter' ? 'No sessions created yet' : 'No sessions available'}
                            </h3>
                            <p className="text-text-secondary mb-8 max-w-md mx-auto">
                                {user?.role === 'Recruiter'
                                    ? 'Create your first mock question session to test candidates applying for your jobs.'
                                    : 'Mock question sessions will appear here once recruiters create them.'
                                }
                            </p>
                            {user?.role === 'Recruiter' && (
                                <Link to="/qa/create">
                                    <Button variant="primary" size="lg">
                                        Create Your First Session
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sessions.map((session) => (
                            <Card
                                key={session._id}
                                padding="lg"
                                hoverable
                                className="transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="space-y-4">
                                    {/* Session Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-text-primary mb-2">
                                                {session.sessionTitle}
                                            </h3>
                                            {session.recruiterId && (
                                                <p className="text-text-secondary text-sm">
                                                    Created by {session.recruiterId.name || 'Unknown Recruiter'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {session.jobId && (
                                                <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                                    <BriefcaseIcon className="w-4 h-4" />
                                                    <span>Job-Linked</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Job Information */}
                                    {session.jobId && (
                                        <div className="bg-background-50 p-4 rounded-xl border border-background-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <BriefcaseIcon className="w-4 h-4 text-primary-600" />
                                                <span className="text-sm font-semibold text-text-primary">Linked Job</span>
                                            </div>
                                            <h4 className="font-semibold text-text-primary">
                                                {session.jobId.title || 'Job Title'}
                                            </h4>
                                            <p className="text-sm text-text-secondary">
                                                {session.jobId.company || 'Company'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Session Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-4 h-4 text-text-secondary" />
                                            <span className="text-sm text-text-secondary">
                                                Created {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-text-secondary" />
                                            <span className="text-sm text-text-secondary">
                                                {session.questions?.length || 0} question{(session.questions?.length || 0) !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-3 pt-4 border-t border-background-200">
                                        <Link to={`/qa/${session._id}`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full">
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                <span>View Details</span>
                                            </Button>
                                        </Link>

                                        {user?.role === 'Student' && (
                                            <Link to={`/qa/student/${session._id}`} className="flex-1">
                                                <Button variant="primary" size="sm" className="w-full">
                                                    <PencilIcon className="w-4 h-4 mr-2" />
                                                    <span>Answer Questions</span>
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QASessionsList;



