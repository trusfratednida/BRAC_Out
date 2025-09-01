import React, { useState, useEffect } from 'react';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const CourseEnrollmentStats = ({ courseId }) => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const response = await courseEndpoints.get(courseId);
            const course = response.data?.data?.course;
            if (course && course.enrollments) {
                setEnrollments(course.enrollments);
            }
        } catch (error) {
            console.error('Failed to load enrollments:', error);
            toast.error('Failed to load enrollment data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            loadEnrollments();
        }
    }, [courseId]);

    const getProgressPercentage = (enrollment) => {
        if (!enrollment || !enrollment.completedCheckpoints) return 0;
        // This would need to be calculated based on total checkpoints in the course
        // For now, we'll show the count of completed checkpoints
        return enrollment.completedCheckpoints.length;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (enrolledAt) => {
        const enrollmentDate = new Date(enrolledAt);
        const sixMonthsLater = new Date(enrollmentDate);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

        const now = new Date();
        const diffTime = sixMonthsLater - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Enrollment Statistics</h3>
                <div className="text-sm text-gray-500">
                    {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-500">No students enrolled yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {enrollments.map((enrollment, index) => {
                        const daysRemaining = getDaysRemaining(enrollment.enrolledAt);
                        const isExpired = daysRemaining <= 0;

                        return (
                            <div
                                key={enrollment.student || index}
                                className={`p-4 rounded-lg border ${isExpired
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isExpired
                                                ? 'bg-red-500 text-white'
                                                : 'bg-blue-500 text-white'
                                            }`}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                Student {index + 1}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Enrolled: {formatDate(enrollment.enrolledAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getProgressPercentage(enrollment)} checkpoints completed
                                        </div>
                                        <div className={`text-xs ${isExpired
                                                ? 'text-red-600 font-medium'
                                                : daysRemaining <= 30
                                                    ? 'text-orange-600 font-medium'
                                                    : 'text-green-600'
                                            }`}>
                                            {isExpired
                                                ? 'Expired'
                                                : `${daysRemaining} days remaining`
                                            }
                                        </div>
                                    </div>
                                </div>

                                {enrollment.completedCheckpoints && enrollment.completedCheckpoints.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-500 mb-2">Recent completions:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {enrollment.completedCheckpoints.slice(-3).map((checkpoint, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                                >
                                                    Checkpoint {idx + 1}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CourseEnrollmentStats;

