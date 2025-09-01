import React, { useState, useEffect } from 'react';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CourseProgress = ({ courseId, onProgressUpdate }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(null);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const response = await courseEndpoints.getProgress(courseId);
            setProgress(response.data?.data?.progress);
        } catch (error) {
            console.error('Failed to load progress:', error);
            toast.error('Failed to load course progress');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            loadProgress();
        }
    }, [courseId]);

    const handleCompleteCheckpoint = async (checkpointId) => {
        try {
            setCompleting(checkpointId);
            await courseEndpoints.completeCheckpoint({
                courseId,
                checkpointId
            });
            toast.success('Checkpoint completed!');
            await loadProgress();
            if (onProgressUpdate) {
                onProgressUpdate();
            }
        } catch (error) {
            console.error('Failed to complete checkpoint:', error);
            toast.error('Failed to complete checkpoint');
        } finally {
            setCompleting(null);
        }
    };

    const getProgressPercentage = () => {
        if (!progress || progress.totalCheckpoints === 0) return 0;
        return Math.round((progress.completedCheckpoints / progress.totalCheckpoints) * 100);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500">No progress data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
                <div className="text-sm text-gray-500">
                    Enrolled: {formatDate(progress.enrolledAt)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {progress.completedCheckpoints} of {progress.totalCheckpoints} checkpoints completed
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                        {getProgressPercentage()}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* Expiration Warning */}
            {progress.isExpired && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-800 font-medium">Course Expired</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                        Your 6-month enrollment period has expired. Remaining checkpoints are locked.
                    </p>
                </div>
            )}

            {/* Checkpoints */}
            <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 mb-3">Checkpoints</h4>
                {progress.checkpoints.length === 0 ? (
                    <p className="text-gray-500 text-sm">No checkpoints available for this course.</p>
                ) : (
                    progress.checkpoints.map((checkpoint, index) => (
                        <div
                            key={checkpoint._id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${checkpoint.isCompleted
                                    ? 'bg-green-50 border-green-200'
                                    : progress.isExpired
                                        ? 'bg-gray-50 border-gray-200'
                                        : 'bg-blue-50 border-blue-200'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${checkpoint.isCompleted
                                        ? 'bg-green-500 text-white'
                                        : progress.isExpired
                                            ? 'bg-gray-300 text-gray-500'
                                            : 'bg-blue-500 text-white'
                                    }`}>
                                    {checkpoint.isCompleted ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : progress.isExpired ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span className="text-xs font-medium">{index + 1}</span>
                                    )}
                                </div>
                                <div>
                                    <h5 className={`font-medium ${checkpoint.isCompleted
                                            ? 'text-green-800'
                                            : progress.isExpired
                                                ? 'text-gray-500'
                                                : 'text-blue-800'
                                        }`}>
                                        {checkpoint.name}
                                    </h5>
                                    {checkpoint.description && (
                                        <p className={`text-sm ${checkpoint.isCompleted
                                                ? 'text-green-600'
                                                : progress.isExpired
                                                    ? 'text-gray-400'
                                                    : 'text-blue-600'
                                            }`}>
                                            {checkpoint.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!checkpoint.isCompleted && !progress.isExpired && (
                                <button
                                    onClick={() => handleCompleteCheckpoint(checkpoint._id)}
                                    disabled={completing === checkpoint._id}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${completing === checkpoint._id
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {completing === checkpoint._id ? 'Marking...' : 'Mark Complete'}
                                </button>
                            )}

                            {checkpoint.isCompleted && (
                                <span className="text-green-600 text-sm font-medium">
                                    Completed
                                </span>
                            )}

                            {progress.isExpired && !checkpoint.isCompleted && (
                                <span className="text-gray-500 text-sm font-medium">
                                    Expired
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseProgress;

