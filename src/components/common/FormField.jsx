// File: src/components/common/FormField.jsx
import React from 'react';

export const FormField = ({ label, children, error, helperText, required = false }) => {
    return (
        <div className="space-y-1.5 text-left">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {label} {required && <span className="text-rose-400">*</span>}
                </label>
            )}
            {children}
            {error && (
                <p className="text-xs text-rose-400 font-medium" role="alert">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-[11px] text-zinc-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};
