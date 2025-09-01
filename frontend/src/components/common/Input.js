import React from 'react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
    name,
    register,
    autoComplete,
    icon,
    ...props
}) => {
    const baseClasses = 'w-full px-4 py-4 border-2 border-background-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 ease-out bg-white text-text-primary placeholder-text-secondary text-base font-medium shadow-soft hover:shadow-medium focus:shadow-medium';
    const errorClasses = error ? 'border-error-400 focus:ring-error-500 focus:border-error-500' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-background-100 border-background-300' : '';

    const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

    // Determine autocomplete value based on type and name
    const getAutoComplete = () => {
        if (autoComplete) return autoComplete;

        switch (type) {
            case 'email':
                return 'email';
            case 'password':
                return name === 'confirmPassword' ? 'new-password' : 'current-password';
            case 'tel':
                return 'tel';
            case 'url':
                return 'url';
            default:
                if (name === 'name') return 'name';
                if (name === 'department') return 'organization';
                if (name === 'company') return 'organization';
                return 'off';
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-base font-semibold text-text-primary">
                    {label}
                    {required && <span className="text-error-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <div className="text-text-secondary">
                            {icon}
                        </div>
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={getAutoComplete()}
                    className={`${classes} ${icon ? 'pl-12' : ''}`}
                    {...(register ? register(name) : {})}
                    {...props}
                />
                {error && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <div className="text-error-500">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <div className="flex items-center space-x-2 text-sm text-error-600 animate-fade-in">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
};

export default Input;
