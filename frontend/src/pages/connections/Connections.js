import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connectionEndpoints, userEndpoints } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Connections = () => {
    const { user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const [connRes, inRes, outRes] = await Promise.all([
                connectionEndpoints.list(),
                connectionEndpoints.incoming(),
                connectionEndpoints.outgoing()
            ]);
            setConnections(connRes.data?.data?.connections || []);
            setIncoming(inRes.data?.data?.incoming || []);
            setOutgoing(outRes.data?.data?.outgoing || []);
        } catch (e) {
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const approve = async (id) => {
        try {
            await connectionEndpoints.approve(id);
            toast.success('Connection approved');
            await load();
        } catch (e) {
            toast.error('Failed to approve');
        }
    };

    const sendRequest = async (targetId) => {
        try {
            if (!targetId) return;
            await connectionEndpoints.request({ targetId });
            toast.success('Request sent');
            await load();
        } catch (e) {
            toast.error('Failed to send request');
        }
    };

    const doSearch = async () => {
        try {
            const q = search.trim();
            if (!q) { setResults([]); return; }
            const res = await userEndpoints.search(q, 10);
            setResults(res.data?.data?.users || []);
        } catch (e) {
            toast.error('Search failed');
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            {/* Search */}
            <div>
                <h1 className="text-2xl font-semibold mb-3">Find People</h1>
                <div className="flex gap-2 mb-4">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email" className="flex-1 border rounded px-3 py-2" />
                    <button onClick={doSearch} className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
                </div>
                {results.length > 0 && (
                    <div className="space-y-2">
                        {results.map(u => (
                            <div key={u._id} className="bg-white border rounded p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">{u.name}</div>
                                    <div className="text-sm text-gray-600">{u.email} • {u.role}</div>
                                </div>
                                {u._id === user?._id ? (
                                    <span className="text-xs text-gray-500">This is you</span>
                                ) : (
                                    <button onClick={() => sendRequest(u._id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Connect</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Incoming Requests */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Incoming Requests</h2>
                {incoming.length === 0 ? (
                    <div className="text-gray-600">No incoming requests.</div>
                ) : (
                    <div className="space-y-2">
                        {incoming.map(r => (
                            <div key={r._id} className="bg-white border rounded p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">{r.requesterId?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-600">{r.requesterId?.email}</div>
                                </div>
                                <button onClick={() => approve(r._id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Approve</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Outgoing Requests */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Outgoing Requests</h2>
                {outgoing.length === 0 ? (
                    <div className="text-gray-600">No outgoing requests.</div>
                ) : (
                    <div className="space-y-2">
                        {outgoing.map(r => (
                            <div key={r._id} className="bg-white border rounded p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">{r.targetId?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-600">{r.targetId?.email}</div>
                                </div>
                                <span className="text-xs text-gray-500">Pending</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Connections */}
            <div>
                <h2 className="text-xl font-semibold mb-3">My Connections</h2>
                {connections.length === 0 ? (
                    <div className="text-gray-600">No connections yet.</div>
                ) : (
                    <div className="space-y-2">
                        {connections.map(c => {
                            const other = c.requesterId?._id === user?._id ? c.targetId : c.requesterId;
                            return (
                                <div key={c._id} className="bg-white border rounded p-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900">{other?.name || 'Unknown'}</div>
                                        <div className="text-sm text-gray-600">{other?.email}</div>
                                    </div>
                                    {other?._id && (
                                        <Link to={`/messages/conversation/${other._id}`} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Message</Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;


