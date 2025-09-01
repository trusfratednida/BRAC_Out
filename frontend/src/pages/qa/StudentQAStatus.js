import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { qaSessionEndpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentQAStatus = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await qaSessionEndpoints.getStudentStatus(id);
                setData(res.data?.data || null);
            } catch (e) {
                toast.error('Failed to load status');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const submit = async () => {
        try {
            await qaSessionEndpoints.submitAnswers(id, { answers });
            toast.success('Answers submitted');
        } catch (e) {
            toast.error('Submit failed');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!data) return <div className="p-6">Not found</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">{data.sessionTitle || 'Q&A Status'}</h1>
            <div className="mb-4">Status: <span className="font-semibold">{data.status}</span></div>
            <div className="bg-white border rounded p-4">
                <h2 className="font-semibold mb-2">Questions</h2>
                <ol className="list-decimal pl-6 space-y-1">
                    {data.questions?.map((q, i) => (
                        <li key={i}>
                            <div className="mb-1">{q}</div>
                            <input
                                className="w-full border rounded px-2 py-1 mb-2"
                                placeholder="Your answer"
                                onChange={(e) => {
                                    const arr = [...answers];
                                    arr[i] = e.target.value;
                                    setAnswers(arr);
                                }}
                            />
                        </li>
                    ))}
                </ol>
            </div>
            <div className="mt-4">
                <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit Answers</button>
            </div>
        </div>
    );
};

export default StudentQAStatus;


