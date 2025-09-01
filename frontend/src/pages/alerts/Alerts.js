import React, { useEffect, useState } from 'react';
import { alertEndpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const res = await alertEndpoints.list();
            const list = res.data?.data?.alerts || res.data?.data || [];
            setAlerts(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const markSeen = async (id) => {
        try {
            await alertEndpoints.markSeen(id);
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, seen: true } : a));
        } catch (e) {
            toast.error('Failed to mark as seen');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Alerts</h1>
            {alerts.length === 0 ? (
                <p className="text-gray-600">No alerts.</p>
            ) : (
                <ul className="space-y-3">
                    {alerts.map(a => (
                        <li key={a._id} className="bg-white border rounded p-4 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleString()} • {a.type}</div>
                                <div className="text-gray-900">{a.message}</div>
                            </div>
                            <div>
                                {a.seen ? (
                                    <span className="text-green-600 text-sm">Seen</span>
                                ) : (
                                    <button onClick={() => markSeen(a._id)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded">Mark seen</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Alerts;



