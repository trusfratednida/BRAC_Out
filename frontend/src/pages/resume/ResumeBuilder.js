import React, { useState } from 'react';
import { resumeEndpoints } from '../../services/api';
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        try {
            setLoading(true);
            const res = await resumeEndpoints.generate();
            const d = res.data?.data;
            setUrl(d?.url || '');
            toast.success('Resume generated');
        } catch (e) {
            toast.error('Failed to generate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Resume Builder</h1>
            <button onClick={generate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                {loading ? 'Generating...' : 'Generate Resume'}
            </button>
            {url && (
                <div className="mt-4">
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-600">Download Resume</a>
                </div>
            )}
        </div>
    );
};

export default ResumeBuilder;



