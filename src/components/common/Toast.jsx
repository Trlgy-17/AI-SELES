// File: src/components/common/Toast.jsx
import React from 'react';
import { Icons } from '../Icons.jsx';

export const Toast = ({ toast }) => {
    if (!toast) return null;
    const isError = toast.type === 'error';
    const isWarning = toast.type === 'warning';

    return (
        <div 
            role="status" 
            aria-live="polite" 
            className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 px-4 sm:px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in text-xs sm:text-sm font-semibold transition-all safe-padding-bottom ${
                isError ? 'bg-rose-950 border-rose-800 text-rose-100' :
                isWarning ? 'bg-amber-950 border-amber-800 text-amber-100' :
                'bg-[#1a1a22] border-[#c5a059]/40 text-white shadow-[#c5a059]/10'
            }`}
        >
            <div className={isError ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-[#c5a059]'}>
                {isError ? <Icons.AlertTriangle /> : <Icons.CheckCircle />}
            </div>
            <span>{toast.message}</span>
        </div>
    );
};
