// File: src/components/common/ConfirmModal.jsx
import React, { useEffect } from 'react';
import { Icons } from '../Icons.jsx';

export const ConfirmModal = ({ 
    isOpen, 
    title = "Konfirmasi Tindakan", 
    message, 
    confirmText = "Hapus", 
    cancelText = "Batal", 
    onConfirm, 
    onCancel, 
    isLoading = false 
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel, isLoading]);

    if (!isOpen) return null;

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="confirm-modal-title" 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto safe-padding-bottom safe-padding-top"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) onCancel();
            }}
        >
            <div className="bg-[#15151a] border border-[#26262d] rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90dvh] overflow-y-auto">
                <div className="flex items-center gap-3 text-rose-400">
                    <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-800 flex-shrink-0">
                        <Icons.AlertTriangle />
                    </div>
                    <h3 id="confirm-modal-title" className="serif-font font-bold text-base sm:text-lg text-white">
                        {title}
                    </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-2.5 pt-2">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        disabled={isLoading}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-[#202028] hover:bg-[#282832] transition-colors min-h-[44px] touch-manipulation active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50 min-h-[44px] touch-manipulation active:scale-95"
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
