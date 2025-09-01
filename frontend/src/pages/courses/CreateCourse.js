import React, { useState } from 'react';
import { courseEndpoints } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [courseName, setCourseName] = useState('');
    const [duration, setDuration] = useState('6 months');
    const [description, setDescription] = useState('');
    const [banner, setBanner] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [checkpoints, setCheckpoints] = useState([
        { name: 'Bubble Sort', description: 'Learn and implement bubble sort algorithm', order: 1 },
        { name: 'A* Search', description: 'Master A* pathfinding algorithm', order: 2 },
        { name: 'Data Structures', description: 'Understand fundamental data structures', order: 3 }
    ]);
    const [loading, setLoading] = useState(false);

    const addCheckpoint = () => {
        const newOrder = checkpoints.length + 1;
        setCheckpoints([...checkpoints, { name: '', description: '', order: newOrder }]);
    };

    const removeCheckpoint = (index) => {
        const updatedCheckpoints = checkpoints.filter((_, i) => i !== index);
        // Reorder remaining checkpoints
        const reorderedCheckpoints = updatedCheckpoints.map((checkpoint, i) => ({
            ...checkpoint,
            order: i + 1
        }));
        setCheckpoints(reorderedCheckpoints);
    };

    const updateCheckpoint = (index, field, value) => {
        const updatedCheckpoints = [...checkpoints];
        updatedCheckpoints[index] = { ...updatedCheckpoints[index], [field]: value };
        setCheckpoints(updatedCheckpoints);
    };

    const moveCheckpoint = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === checkpoints.length - 1)) {
            return;
        }

        const updatedCheckpoints = [...checkpoints];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap checkpoints
        [updatedCheckpoints[index], updatedCheckpoints[targetIndex]] = [updatedCheckpoints[targetIndex], updatedCheckpoints[index]];

        // Update order numbers
        updatedCheckpoints.forEach((checkpoint, i) => {
            checkpoint.order = i + 1;
        });

        setCheckpoints(updatedCheckpoints);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!courseName.trim()) return toast.error('Course name is required');

        // Validate checkpoints
        const validCheckpoints = checkpoints.filter(cp => cp.name.trim() !== '');
        if (validCheckpoints.length === 0) {
            return toast.error('At least one checkpoint is required');
        }

        try {
            setLoading(true);
            await courseEndpoints.create({
                courseName: courseName.trim(),
                duration: duration.trim(),
                description: description.trim(),
                banner: banner.trim(),
                videoUrl: videoUrl.trim(),
                checkpoints: validCheckpoints
            });
            toast.success('Course created');
            navigate('/courses');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-6">Create Course</h1>
            <form onSubmit={submit} className="space-y-6">
                {/* Basic Course Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Course Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="e.g., Recruiter 6-month course"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="6 months"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the course"
                        />
                    </div>
                </div>

                {/* Media URLs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Media</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                                placeholder="https://.../banner.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Video URL (MP4)</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://.../promo.mp4"
                            />
                        </div>
                    </div>
                </div>

                {/* Checkpoints */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Course Checkpoints</h2>
                        <button
                            type="button"
                            onClick={addCheckpoint}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Add Checkpoint
                        </button>
                    </div>

                    <div className="space-y-4">
                        {checkpoints.map((checkpoint, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">#{checkpoint.order}</span>
                                        <div className="flex space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => moveCheckpoint(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveCheckpoint(index, 'down')}
                                                disabled={index === checkpoints.length - 1}
                                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCheckpoint(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Checkpoint Name</label>
                                        <input
                                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={checkpoint.name}
                                            onChange={(e) => updateCheckpoint(index, 'name', e.target.value)}
                                            placeholder="e.g., Bubble Sort"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input
                                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={checkpoint.description}
                                            onChange={(e) => updateCheckpoint(index, 'description', e.target.value)}
                                            placeholder="Brief description of this checkpoint"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {checkpoints.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No checkpoints added yet. Click "Add Checkpoint" to get started.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;


