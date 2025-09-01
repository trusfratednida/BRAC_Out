import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    showPageNumbers = true,
    showInfo = true,
    size = 'md',
    ...props
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-lg'
    };

    if (totalPages <= 1) return null;

    return (
        <div className={`flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mt-8 ${className}`} {...props}>
            {/* Page Info */}
            {showInfo && (
                <div className="text-text-secondary text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${sizeClasses[size]} font-semibold bg-white text-text-primary border-2 border-background-200 rounded-xl hover:bg-background-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium hover:scale-105 flex items-center space-x-2`}
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Previous</span>
                </button>

                {/* Page Numbers */}
                {showPageNumbers && (
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                                disabled={page === '...'}
                                className={`${sizeClasses[size]} font-semibold rounded-xl transition-all duration-300 ease-out shadow-soft hover:shadow-medium hover:scale-105 ${page === currentPage
                                        ? 'bg-primary-500 text-white border-2 border-primary-500 shadow-medium'
                                        : page === '...'
                                            ? 'bg-transparent text-text-secondary cursor-default border-2 border-transparent'
                                            : 'bg-white text-text-primary border-2 border-background-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${sizeClasses[size]} font-semibold bg-white text-text-primary border-2 border-background-200 rounded-xl hover:bg-background-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-medium hover:scale-105 flex items-center space-x-2`}
                >
                    <span>Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
