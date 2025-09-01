import React from 'react';

const LoadingSpinner = ({
    size = 'md',
    color = 'primary',
    text = 'Loading...',
    variant = 'spinner',
    className = ''
}) => {
    const sizeClasses = {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-24 w-24'
    };

    const colorClasses = {
        primary: 'border-primary-500',
        secondary: 'border-secondary-500',
        success: 'border-success-500',
        warning: 'border-warning-500',
        error: 'border-error-500',
        white: 'border-white',
        gray: 'border-background-500'
    };

    const textSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl'
    };

    const renderSpinner = () => {
        switch (variant) {
            case 'dots':
                return (
                    <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                );
            case 'pulse':
                return (
                    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse bg-current`} />
                );
            case 'bars':
                return (
                    <div className="flex space-x-1">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-1 ${colorClasses[color]} animate-pulse bg-current`}
                                style={{
                                    height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '32px' : size === 'lg' ? '48px' : size === 'xl' ? '64px' : '96px',
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                );
            default:
                return (
                    <div
                        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-t-transparent`}
                    />
                );
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            {renderSpinner()}
            {text && (
                <p className={`mt-3 ${textSizeClasses[size]} text-text-secondary font-medium text-center`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
