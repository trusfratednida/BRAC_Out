import React, { useEffect, useState } from 'react';
import { messageEndpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    EnvelopeIcon,
    ClockIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const Inbox = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await messageEndpoints.inbox();
                const arr = res.data?.data?.threads || [];
                setThreads(Array.isArray(arr) ? arr : []);
            } catch (e) {
                toast.error('Failed to load inbox');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background-50 via-background-100 to-background-200 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-text-primary mb-4">Messages</h1>
                    <p className="text-xl text-text-secondary">Stay connected with your network through direct messaging</p>
                </div>

                {threads.length === 0 ? (
                    <Card padding="xl" className="text-center">
                        <div className="py-16">
                            <div className="mx-auto w-24 h-24 bg-background-100 rounded-full flex items-center justify-center mb-6">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-background-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">No messages yet</h3>
                            <p className="text-text-secondary mb-8 max-w-md mx-auto">
                                Start connecting with other users by sending them a message. Your conversations will appear here.
                            </p>
                            <Button variant="primary" size="lg">
                                Start a Conversation
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {threads.map((thread, index) => (
                            <Card
                                key={thread.lastMessage?._id || index}
                                padding="lg"
                                hoverable
                                className="transition-all duration-300 hover:scale-[1.02]"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                                                {thread.other?.profile?.photo ? (
                                                    <img
                                                        src={thread.other.profile.photo}
                                                        alt={thread.other.name}
                                                        className="w-16 h-16 rounded-2xl object-cover"
                                                    />
                                                ) : (
                                                    <UserCircleIcon className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                        </div>

                                        {/* User Info and Message */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-text-primary truncate">
                                                    {thread.other?.name || 'Unknown User'}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <EnvelopeIcon className="w-4 h-4 text-text-secondary" />
                                                    <span className="text-sm text-text-secondary">
                                                        {thread.other?.email || 'No email'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3 mb-3">
                                                <ClockIcon className="w-4 h-4 text-text-secondary" />
                                                <span className="text-sm text-text-secondary">
                                                    {thread.lastMessage?.createdAt ?
                                                        new Date(thread.lastMessage.createdAt).toLocaleString() :
                                                        'No timestamp'
                                                    }
                                                </span>
                                            </div>

                                            <p className="text-text-secondary truncate max-w-md">
                                                {thread.lastMessage?.message || 'No message content'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex-shrink-0 ml-6">
                                        {thread.other?._id && (
                                            <Link to={`/messages/conversation/${thread.other._id}`}>
                                                <Button
                                                    variant="primary"
                                                    size="md"
                                                    className="group"
                                                >
                                                    <span>Open Chat</span>
                                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;



