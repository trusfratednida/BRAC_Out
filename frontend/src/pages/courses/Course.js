import React, { useEffect, useState } from 'react';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const Course = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    const load = async () => {
        try {
            setLoading(true);
            const listRes = await courseEndpoints.list();
            const first = (listRes.data?.data?.courses || [])[0];
            if (first) {
                const detRes = await courseEndpoints.get(first._id);
                setDetails(detRes.data?.data || null);
            } else {
                setDetails(null);
            }
        } catch (e) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const enroll = async () => {
        try {
            setEnrolling(true);
            if (!details?.course?._id) return;
            await courseEndpoints.enroll({ courseId: details.course._id });
            toast.success('Enrolled');
            await load();
        } catch (e) {
            toast.error('Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!details) return <div className="p-6">Not found</div>;

    const { course, enrolled } = details;

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">{course?.courseName}</h1>
            <div className="text-gray-600 mb-4">Duration: {course?.duration}</div>
            <p className="mb-6">{course?.description}</p>
            {enrolled ? (
                <div className="text-green-600 font-medium">You are enrolled</div>
            ) : (
                <button onClick={enroll} disabled={enrolling} className="px-4 py-2 bg-blue-600 text-white rounded">
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
            )}
        </div>
    );
};

export default Course;


