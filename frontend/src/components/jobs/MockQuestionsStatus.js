import React, { useState, useEffect } from 'react';
import { qaSessionEndpoints } from '../../services/api';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';
import {
    ChatBubbleLeftRightIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MockQuestionsStatus = ({ jobId, userId }) => {
    const [qaSessions, setQaSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (jobId) {
            fetchQASessions();
        }
    }, [jobId]);

    const fetchQASessions = async () => {
        try {
            setLoading(true);
            const response = await qaSessionEndpoints.getJobQASessions(jobId);
            const sessions = response.data?.data?.sessions || [];
            setQaSessions(sessions);

            // Initialize answers state
            const initialAnswers = {};
            sessions.forEach(session => {
                if (session.students) {
                    const student = session.students.find(s => s.userId === userId);
                    if (student && student.answers) {
                        initialAnswers[session._id] = student.answers;
                    } else {
                        initialAnswers[session._id] = new Array(session.questions.length).fill('');
                    }
                }
            });
            setAnswers(initialAnswers);
        } catch (error) {
            console.error('Error fetching QA sessions:', error);
            toast.error('Failed to load mock questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (sessionId, questionIndex, value) => {
        setAnswers(prev => ({
            ...prev,
            [sessionId]: prev[sessionId].map((answer, index) =>
                index === questionIndex ? value : answer
            )
        }));
    };

    const handleSubmitAnswers = async (sessionId) => {
        const sessionAnswers = answers[sessionId];
        if (sessionAnswers.some(answer => !answer.trim())) {
            toast.error('Please answer all questions');
            return;
        }

        try {
            setSubmitting(true);
            await qaSessionEndpoints.submitAnswers(sessionId, { answers: sessionAnswers });
            toast.success('Answers submitted successfully!');

            // Refresh sessions to update status
            fetchQASessions();
        } catch (error) {
            console.error('Error submitting answers:', error);
            toast.error('Failed to submit answers');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Card padding="lg">
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
            </Card>
        );
    }

    if (qaSessions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {qaSessions.map((session) => {
                const student = session.students?.find(s => s.userId === userId);
                const isCompleted = student?.status === 'completed';
                const hasAnswers = student?.answers && student.answers.length > 0;

                return (
                    <Card key={session._id} padding="lg" className="border-2 border-primary-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-text-primary flex items-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-primary-600" />
                                {session.sessionTitle}
                            </h3>
                            <div className="flex items-center">
                                {isCompleted ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Completed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {isCompleted ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-green-800 font-medium">
                                        ✅ You have completed the mock questions for this job application.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {session.questions.map((question, index) => (
                                        <div key={index} className="p-3 bg-background-50 rounded-lg">
                                            <p className="font-medium text-text-primary mb-2">
                                                Question {index + 1}:
                                            </p>
                                            <p className="text-text-secondary mb-2">{question}</p>
                                            <p className="text-sm text-text-primary">
                                                <span className="font-medium">Your Answer:</span> {student.answers[index]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-yellow-800 font-medium">
                                        ⚠️ Please complete the mock questions to finalize your application.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {session.questions.map((question, index) => (
                                        <div key={index}>
                                            <label className="block text-base font-semibold text-text-primary mb-2">
                                                Question {index + 1}:
                                            </label>
                                            <p className="text-text-secondary mb-3">{question}</p>
                                            <textarea
                                                value={answers[session._id]?.[index] || ''}
                                                onChange={(e) => handleAnswerChange(session._id, index, e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white text-text-primary placeholder-text-secondary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium"
                                                placeholder="Your answer..."
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={() => handleSubmitAnswers(session._id)}
                                    variant="primary"
                                    disabled={submitting}
                                    className="w-full"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Answers'}
                                </Button>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default MockQuestionsStatus;












