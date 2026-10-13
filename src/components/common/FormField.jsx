// File: src/components/common/FormField.jsx
import React from 'react';

export const FormField = ({ label, htmlFor, children, error, helperText, required = false, className = '' }) => {
    return (
        <div className={`space-y-1.5 text-left ${className}`}>
            {label && (
                <label htmlFor={htmlFor} className="block text-label font-medium text-fg-2">
                    {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
                </label>
            )}
            {children}
            {error && (
                <p className="text-label text-danger" role="alert">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-caption text-fg-muted">
                    {helperText}
                </p>
            )}
        </div>
    );
};
