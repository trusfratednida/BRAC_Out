import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { qaSessionEndpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const QASessionDetail = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await qaSessionEndpoints.getById(id);
                setSession(res.data?.data?.session || res.data?.data || null);
            } catch (e) {
                toast.error('Failed to load session');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!session) return <div className="p-6">Not found</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">{session.sessionTitle}</h1>
            <div className="bg-white border rounded p-4 mb-6">
                <h2 className="font-semibold mb-2">Questions</h2>
                <ol className="list-decimal pl-6 space-y-1">
                    {session.questions?.map((q, i) => (
                        <li key={i}>{q}</li>
                    ))}
                </ol>
            </div>

            <div className="bg-white border rounded p-4">
                <h2 className="font-semibold mb-3">Student Answers</h2>
                {session.students?.length ? (
                    <div className="space-y-4">
                        {session.students.map((s, idx) => (
                            <div key={idx} className="border rounded p-3">
                                <div className="font-medium mb-1">{s.userId?.name || 'Student'} ({s.userId?.email})</div>
                                <div className="text-sm text-gray-600 mb-2">Status: {s.status}</div>
                                {s.answers?.length ? (
                                    <ol className="list-decimal pl-6 space-y-1">
                                        {s.answers.map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div className="text-gray-500">No answers submitted</div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500">No student answers yet.</div>
                )}
            </div>
        </div>
    );
};

export default QASessionDetail;



