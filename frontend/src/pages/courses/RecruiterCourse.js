import React, { useEffect, useState } from 'react';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const RecruiterCourse = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const ensureCourse = async () => {
            try {
                setLoading(true);
                // Try to find the recruiter 6-month course by listing and matching name
                const listRes = await courseEndpoints.list();
                const list = listRes.data?.data?.courses || [];
                let rc = list.find(c => (c.courseName || '').toLowerCase() === 'recruiter 6-month course');
                if (!rc) {
                    // Create course if not exists (requires admin; if fails, just show not found)
                    try {
                        const createRes = await courseEndpoints.create({ courseName: 'Recruiter 6-month course', duration: '6 months', description: 'Master recruiting over six months: sourcing, interviews, DEI, pipelines, employer branding, and tools.' });
                        rc = createRes.data?.data?.course;
                    } catch (e) {
                        // Silently ignore if not allowed; just pick first matching 6-month course
                        rc = list.find(c => (c.duration || '').toLowerCase().includes('6')) || null;
                    }
                }
                setCourse(rc || null);
            } catch (e) {
                toast.error('Failed to load course');
            } finally {
                setLoading(false);
            }
        };
        ensureCourse();
    }, []);

    const enroll = async () => {
        if (!course?._id) return;
        try {
            setEnrolling(true);
            await courseEndpoints.enroll({ courseId: course._id });
            toast.success('Enrolled');
        } catch (e) {
            toast.error('Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!course) return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">Recruiter 6-month Course</h1>
            <p className="text-gray-600">Course not available right now.</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Visual banner */}
            <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                <img
                    src={course.banner || '/default-course-banner.png'}
                    alt="Course banner"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </div>
            <h1 className="text-2xl font-semibold mb-2">{course.courseName}</h1>
            <div className="text-gray-600 mb-4">Duration: {course.duration}</div>
            <p className="mb-6">{course.description || 'This curated 6-month track helps recruiters build strong foundations and advanced skills.'}</p>
            <button onClick={enroll} disabled={enrolling} className="px-4 py-2 bg-purple-600 text-white rounded">
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">What you will learn</h2>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Talent sourcing strategies and tools</li>
                    <li>Structured interviews and assessments</li>
                    <li>Diversity, equity, and inclusion in hiring</li>
                    <li>Pipeline management and stakeholder updates</li>
                    <li>Employer branding and candidate experience</li>
                </ul>
            </div>
            {/* Promo video */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Watch a quick overview</h2>
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video controls className="w-full h-full">
                        <source src={course.videoUrl || ''} type="video/mp4" />
                    </video>
                </div>
            </div>
        </div>
    );
};

export default RecruiterCourse;


