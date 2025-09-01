import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingCourse, setDeletingCourse] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await courseEndpoints.list({ recruiterOnly: true });
                setCourses(res.data?.data?.courses || []);
            } catch (e) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingCourse(courseId);
            await courseEndpoints.delete(courseId);
            toast.success('Course deleted successfully');

            // Remove the course from the local state
            setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        } finally {
            setDeletingCourse(null);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Courses</h1>
            {courses.length === 0 ? (
                <div className="text-gray-600">No courses available.</div>
            ) : (
                <ul className="space-y-2">
                    {courses.map(c => (
                        <li key={c._id} className="bg-white border rounded p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-gray-900 font-medium">{c.courseName}</div>
                                    <div className="text-sm text-gray-600">
                                        {c.duration} {c.postedBy ? `• by ${c.postedBy.name}` : ''}
                                        {user?.role === 'Recruiter' && c.studentCount !== undefined && (
                                            <span className="ml-2 text-blue-600 font-medium">
                                                • {c.studentCount} student{c.studentCount !== 1 ? 's' : ''} enrolled
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link className="text-blue-600 text-sm" to={`/courses/${c._id}`}>View</Link>
                                    {user?.role === 'Student' && (
                                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={async () => {
                                            try { await courseEndpoints.enroll({ courseId: c._id }); toast.success('Enrolled'); }
                                            catch { toast.error('Failed to enroll'); }
                                        }}>Enroll</button>
                                    )}
                                    {user?.role === 'Admin' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCourse(c._id)}
                                            disabled={deletingCourse === c._id}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {deletingCourse === c._id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CoursesList;



