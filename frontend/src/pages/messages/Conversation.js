import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { messageEndpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Conversation = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            const res = await messageEndpoints.conversation(id);
            const arr = res.data?.data?.messages || res.data?.data || [];
            setMessages(Array.isArray(arr) ? arr : []);
        } catch (e) {
            toast.error('Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const send = async () => {
        try {
            if (!text.trim()) return;
            await messageEndpoints.send({ receiverId: id, message: text });
            setText('');
            await load();
        } catch (e) {
            toast.error('Failed to send');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Conversation</h1>
            <div className="bg-white border rounded p-4 h-96 overflow-y-auto space-y-3">
                {messages.map(m => {
                    const isMine = m.senderId === user?._id || m.senderId?._id === user?._id;
                    return (
                        <div key={m._id} className={`max-w-[80%] px-3 py-2 rounded ${isMine ? 'ml-auto bg-indigo-600 text-white' : 'mr-auto bg-gray-200 text-gray-900'}`}>
                            <div className={`text-[10px] ${isMine ? 'text-indigo-100' : 'text-gray-600'}`}>{new Date(m.createdAt).toLocaleString()}</div>
                            <div className="whitespace-pre-wrap">{m.message}</div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Type a message..." />
                <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
            </div>
        </div>
    );
};

export default Conversation;



