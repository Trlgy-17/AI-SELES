// File: src/components/common/Toast.jsx
import React from 'react';
import { CircleCheck, TriangleAlert, Info, CircleX } from 'lucide-react';

const STYLES = {
    error: { icon: CircleX, tone: 'text-red-400' },
    warning: { icon: TriangleAlert, tone: 'text-amber-400' },
    info: { icon: Info, tone: 'text-primary-text' },
    success: { icon: CircleCheck, tone: 'text-emerald-400' }
};

export const Toast = ({ toast }) => {
    if (!toast) return null;
    const { icon: Icon, tone } = STYLES[toast.type] || STYLES.success;

    return (
        <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-[55] flex justify-center sm:justify-end md:bottom-6 sm:left-auto sm:right-6 safe-padding-bottom md:pb-0">
            <div
                role="status"
                aria-live="polite"
                className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-body-sm text-fg shadow-floating animate-sheet-up sm:max-w-sm"
            >
                <Icon size={18} className={`mt-px shrink-0 ${tone}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
            </div>
        </div>
    );
};
