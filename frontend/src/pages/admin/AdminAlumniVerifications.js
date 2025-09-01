import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminAlumniVerifications = () => {
    const { user } = useAuth();
    const [alumni, setAlumni] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        fetchAlumniVerifications();
    }, [currentPage]);

    const fetchAlumniVerifications = async () => {
        try {
            setIsLoading(true);
            const response = await adminEndpoints.getPendingAlumniVerifications({
                page: currentPage,
                limit: 10
            });

            // Fix: Access the correct nested data structure
            const alumniData = response.data?.data?.alumni || response.data?.alumni || [];
            const paginationData = response.data?.data?.pagination || response.data?.pagination || { totalPages: 1 };

            setAlumni(alumniData);
            setTotalPages(paginationData.totalPages || 1);
        } catch (error) {
            console.error('Error fetching alumni verifications:', error);
            if (error.response?.status === 401) {
                toast.error('Please log in to view alumni verifications');
            } else if (error.response?.status === 403) {
                toast.error('You are not authorized to view alumni verifications');
            } else {
                toast.error('Failed to load alumni verifications');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (isApproved) => {
        if (!selectedAlumni) return;

        try {
            setIsVerifying(true);
            await adminEndpoints.verifyAlumniAccount(selectedAlumni._id, {
                isApproved,
                verificationNotes
            });

            toast.success(isApproved ? 'Alumni account verified successfully' : 'Alumni account verification rejected');

            // Remove the verified alumni from the list
            setAlumni(prev => prev.filter(a => a._id !== selectedAlumni._id));

            // Close modal and reset
            setShowVerificationModal(false);
            setSelectedAlumni(null);
            setVerificationNotes('');

            // Refresh the list
            fetchAlumniVerifications();
        } catch (error) {
            toast.error('Failed to process verification');
        } finally {
            setIsVerifying(false);
        }
    };

    const openVerificationModal = (alumni) => {
        setSelectedAlumni(alumni);
        setVerificationNotes('');
        setShowVerificationModal(true);
    };

    const closeVerificationModal = () => {
        setShowVerificationModal(false);
        setSelectedAlumni(null);
        setVerificationNotes('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading alumni verifications..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Alumni Verifications</h1>
                    <p className="mt-2 text-gray-600">
                        Review and verify unverified alumni accounts by checking their BRACU ID cards.
                    </p>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Pending</p>
                            <p className="text-2xl font-semibold text-yellow-600">{alumni.length}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Page</p>
                            <p className="text-2xl font-semibold text-gray-900">{currentPage}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Pages</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalPages}</p>
                        </div>
                    </div>
                </div>

                {/* Alumni List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Pending Verifications</h2>
                    </div>

                    {alumni.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No unverified alumni accounts found.</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {alumni.map((alumniUser) => (
                                    <div key={alumniUser._id} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        <img
                                                            className="h-16 w-16 rounded-full object-cover"
                                                            src={alumniUser.profile?.photo || '/default-avatar.png'}
                                                            alt={alumniUser.name}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {alumniUser.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">{alumniUser.email}</p>
                                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>Department: {alumniUser.profile?.department}</span>
                                                            <span>Batch: {alumniUser.profile?.batch}</span>
                                                            <span>Role: {alumniUser.role}</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-600">
                                                            <span>Registered: {new Date(alumniUser.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center space-x-2">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                Pending Verification
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ID Card Preview */}
                                                {alumniUser.profile?.bracuIdCard && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">BRACU ID Card:</p>
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={`/upload/idcard/${alumniUser.profile.bracuIdCard}`}
                                                                alt="BRACU ID Card"
                                                                className="h-32 w-auto rounded-lg border border-gray-300 cursor-pointer hover:opacity-80"
                                                                onClick={() => window.open(`/upload/idcard/${alumniUser.profile.bracuIdCard}`, '_blank')}
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                                <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">
                                                                    Click to view full size
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                <Button
                                                    variant="primary"
                                                    onClick={() => openVerificationModal(alumniUser)}
                                                    className="w-full"
                                                >
                                                    Review & Verify
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            {showVerificationModal && selectedAlumni && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Verify Alumni Account
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Review the ID card for <strong>{selectedAlumni.name}</strong>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Email: {selectedAlumni.email}
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Notes (Optional)
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Add any notes about the verification..."
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    variant="primary"
                                    onClick={() => handleVerification(true)}
                                    disabled={isVerifying}
                                    className="flex-1"
                                >
                                    {isVerifying ? 'Verifying...' : 'Approve'}
                                </Button>

                                <Button
                                    variant="warning"
                                    onClick={() => handleVerification(false)}
                                    disabled={isVerifying}
                                    className="flex-1"
                                >
                                    {isVerifying ? 'Processing...' : 'Reject'}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={closeVerificationModal}
                                    disabled={isVerifying}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAlumniVerifications;
