import React from 'react';

const Card = ({
    children,
    title,
    subtitle,
    className = '',
    onClick,
    hoverable = true,
    variant = 'default',
    padding = 'default',
    ...props
}) => {
    const baseClasses = 'bg-white rounded-2xl shadow-soft border border-background-200 transition-all duration-300 ease-out overflow-hidden';
    const hoverClasses = hoverable ? 'hover:shadow-medium hover:scale-105 cursor-pointer hover:border-primary-200' : '';

    const variantClasses = {
        default: '',
        primary: 'border-primary-200 bg-gradient-to-br from-primary-50 to-white',
        success: 'border-success-200 bg-gradient-to-br from-success-50 to-white',
        warning: 'border-warning-200 bg-gradient-to-br from-warning-50 to-white',
        error: 'border-error-200 bg-gradient-to-br from-error-50 to-white',
        elevated: 'shadow-large hover:shadow-2xl'
    };

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    };

    const classes = `${baseClasses} ${hoverClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

    return (
        <div
            className={classes}
            onClick={onClick}
            {...props}
        >
            {(title || subtitle) && (
                <div className="mb-6">
                    {title && (
                        <h3 className="text-xl font-bold text-text-primary mb-3 leading-tight">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-base text-text-secondary leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div>
                {children}
            </div>
        </div>
    );
};

export default Card;
