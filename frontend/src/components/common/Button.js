import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl shadow-button focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transform';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-button hover:shadow-medium border border-primary-600',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-500 shadow-button hover:shadow-medium border border-secondary-600',
        success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 focus:ring-success-500 shadow-button hover:shadow-medium border border-success-600',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 focus:ring-warning-500 shadow-button hover:shadow-medium border border-warning-600',
        error: 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 focus:ring-error-500 shadow-button hover:shadow-medium border border-error-600',
        outline: 'border-2 border-primary-500 text-primary-600 bg-white hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500 shadow-button hover:shadow-medium hover:border-primary-600',
        ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500 hover:scale-105 border border-transparent hover:border-secondary-200',
        light: 'bg-background-100 text-text-primary hover:bg-background-200 focus:ring-background-500 shadow-soft hover:shadow-medium border border-background-200'
    };

    const sizeClasses = {
        xs: 'px-3 py-1.5 text-xs rounded-lg',
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-xl',
        xl: 'px-10 py-5 text-xl rounded-2xl'
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <div className="flex items-center justify-center mr-2">
                    <svg
                        className="animate-spin h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            )}
            {children}
        </button>
    );
};

export default Button;
