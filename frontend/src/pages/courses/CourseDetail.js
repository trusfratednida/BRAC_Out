import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import CourseProgress from '../../components/courses/CourseProgress';
import CourseEnrollmentStats from '../../components/courses/CourseEnrollmentStats';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const res = await courseEndpoints.get(id);
            setDetails(res.data?.data || null);
        } catch (e) {
            toast.error('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const enroll = async () => {
        try {
            setEnrolling(true);
            await courseEndpoints.enroll({ courseId: id });
            toast.success('Enrolled');
            await load();
        } catch (e) {
            toast.error('Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);
            await courseEndpoints.delete(id);
            toast.success('Course deleted successfully');
            navigate('/courses');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!details) return <div className="p-6">Not found</div>;

    const { course, enrolled, studentCount } = details;
    const hasBanner = !!(course?.banner && course.banner.trim());
    const hasVideo = !!(course?.videoUrl && course.videoUrl.trim());
    const toYouTubeEmbed = (url) => {
        try {
            const u = new URL(url);
            // youtu.be/<id>
            if (u.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`;
            }
            // youtube.com/watch?v=<id>
            if (u.hostname.includes('youtube.com')) {
                const id = u.searchParams.get('v');
                if (id) return `https://www.youtube.com/embed/${id}`;
                // youtube.com/embed/<id>
                if (u.pathname.includes('/embed/')) return url;
            }
        } catch (_) { }
        return null;
    };
    const youTubeEmbed = hasVideo ? toYouTubeEmbed(course.videoUrl) : null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero/Banner */}
            <div className="relative w-full h-56 sm:h-64 lg:h-72 bg-gradient-to-r from-indigo-600 to-blue-600">
                {hasBanner && (
                    <img
                        src={course.banner}
                        alt="Course banner"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        {course?.courseName}
                    </h1>
                    <div className="mt-2 text-indigo-100">
                        Duration: {course?.duration || '6 months'}
                    </div>
                    <div className="mt-4 flex gap-3">
                        {enrolled ? (
                            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500/90 text-white font-medium">Enrolled</span>
                        ) : user?.role === 'Student' ? (
                            <button onClick={enroll} disabled={enrolling} className="px-5 py-2.5 rounded-lg bg-white text-indigo-700 font-semibold shadow hover:shadow-md transition">
                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                            </button>
                        ) : null}
                        {user?.role === 'Admin' && (
                            <Button
                                variant="outline"
                                onClick={handleDeleteCourse}
                                disabled={deleting}
                                className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700 border-red-200"
                            >
                                {deleting ? 'Deleting...' : 'Delete Course'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">About this course</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course?.description || 'This curated 6-month track helps learners build strong foundations and advanced skills.'}
                        </p>
                    </div>

                    {hasVideo && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Promo Video</h2>
                            {youTubeEmbed ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        src={youTubeEmbed}
                                        title="Course promo"
                                        className="w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                                    <video controls className="w-full h-full">
                                        <source src={course.videoUrl} type="video/mp4" />
                                    </video>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Course Progress for Enrolled Students */}
                    {enrolled && user?.role === 'Student' && (
                        <div className="mt-6">
                            <CourseProgress
                                courseId={id}
                                onProgressUpdate={load}
                            />
                        </div>
                    )}

                    {/* Enrollment Stats for Recruiters */}
                    {user?.role === 'Recruiter' && course?.postedBy?._id === user?.id && (
                        <div className="mt-6">
                            <CourseEnrollmentStats courseId={id} />
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Course Details</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li><span className="text-gray-500">Duration:</span> {course?.duration || '6 months'}</li>
                            <li><span className="text-gray-500">Posted by:</span> {course?.postedBy?.name || 'Recruiter'}</li>
                            {user?.role === 'Recruiter' && (
                                <li><span className="text-gray-500">Students enrolled:</span> {studentCount || 0}</li>
                            )}
                        </ul>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-6">
                        <h3 className="text-sm font-semibold text-indigo-900 mb-2">What you'll learn</h3>
                        <ul className="list-disc pl-5 text-sm text-indigo-900/90 space-y-1">
                            <li>Talent sourcing strategies and tools</li>
                            <li>Structured interviews and assessments</li>
                            <li>Diversity, equity, and inclusion in hiring</li>
                            <li>Pipeline management and stakeholder updates</li>
                            <li>Employer branding and candidate experience</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CourseDetail;



