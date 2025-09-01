import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminEndpoints } from '../../services/api';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminRecruiterVerifications = () => {
    const { user } = useAuth();
    const [recruiters, setRecruiters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        fetchRecruiterVerifications();
    }, [currentPage]);

    const fetchRecruiterVerifications = async () => {
        try {
            setIsLoading(true);
            const response = await adminEndpoints.getPendingRecruiterVerifications({
                page: currentPage,
                limit: 10
            });

            const recruitersData = response.data?.data?.recruiters || response.data?.recruiters || [];
            const paginationData = response.data?.data?.pagination || response.data?.pagination || { totalPages: 1 };

            setRecruiters(recruitersData);
            setTotalPages(paginationData.totalPages || 1);
        } catch (error) {
            console.error('Error fetching recruiter verifications:', error);
            if (error.response?.status === 401) {
                toast.error('Please log in to view recruiter verifications');
            } else if (error.response?.status === 403) {
                toast.error('You are not authorized to view recruiter verifications');
            } else {
                toast.error('Failed to load recruiter verifications');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (isApproved) => {
        if (!selectedRecruiter) return;

        try {
            setIsVerifying(true);
            await adminEndpoints.verifyRecruiterAccount(selectedRecruiter._id, {
                isApproved,
                verificationNotes
            });

            toast.success(isApproved ? 'Recruiter account verified successfully' : 'Recruiter account verification rejected');

            // Remove the verified recruiter from the list
            setRecruiters(prev => prev.filter(r => r._id !== selectedRecruiter._id));

            // Close modal and reset
            setShowVerificationModal(false);
            setSelectedRecruiter(null);
            setVerificationNotes('');

            // Refresh the list
            fetchRecruiterVerifications();
        } catch (error) {
            toast.error('Failed to process verification');
        } finally {
            setIsVerifying(false);
        }
    };

    const openVerificationModal = (recruiter) => {
        setSelectedRecruiter(recruiter);
        setVerificationNotes('');
        setShowVerificationModal(true);
    };

    const closeVerificationModal = () => {
        setShowVerificationModal(false);
        setSelectedRecruiter(null);
        setVerificationNotes('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading recruiter verifications..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Recruiter Verifications</h1>
                    <p className="mt-2 text-gray-600">
                        Review and verify recruiter accounts by checking their company documents.
                    </p>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Recruiters</p>
                            <p className="text-2xl font-semibold text-purple-600">{recruiters.length}</p>
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

                {/* Recruiters List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Recruiter Accounts</h2>
                    </div>

                    {recruiters.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No recruiter accounts found.</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="space-y-4">
                                {recruiters.map((recruiter) => (
                                    <div key={recruiter._id} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <span className="text-purple-600 font-medium text-xl">
                                                                {recruiter.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {recruiter.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">{recruiter.email}</p>
                                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>Company: {recruiter.profile?.company || 'Not specified'}</span>
                                                            <span>Position: {recruiter.profile?.position || 'Not specified'}</span>
                                                            <span>Role: {recruiter.role}</span>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-600">
                                                            <span>Registered: {new Date(recruiter.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center space-x-2">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                recruiter.isVerified 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {recruiter.isVerified ? 'Verified' : 'Pending Verification'}
                                                            </span>
                                                            {recruiter.profile?.companyDocument && (
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                                    Document Uploaded
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Company Document Preview */}
                                                {recruiter.profile?.companyDocument && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Company Document:</p>
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={`/upload/companydoc/${recruiter.profile.companyDocument}`}
                                                                alt="Company Document"
                                                                className="h-32 w-auto rounded-lg border border-gray-300 cursor-pointer hover:opacity-80"
                                                                onClick={() => window.open(`/upload/companydoc/${recruiter.profile.companyDocument}`, '_blank')}
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
                                                    onClick={() => openVerificationModal(recruiter)}
                                                    className="w-full"
                                                >
                                                    {recruiter.isVerified ? 'Review' : 'Review & Verify'}
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
                                        ? 'bg-purple-600 text-white'
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
            {showVerificationModal && selectedRecruiter && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Verify Recruiter Account
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    Review the account for <strong>{selectedRecruiter.name}</strong>
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Email: {selectedRecruiter.email}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Company: {selectedRecruiter.profile?.company || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Position: {selectedRecruiter.profile?.position || 'Not specified'}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                    Status: 
                                    <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        selectedRecruiter.isVerified 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {selectedRecruiter.isVerified ? 'Verified' : 'Pending Verification'}
                                    </span>
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Notes (Optional)
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

export default AdminRecruiterVerifications;

