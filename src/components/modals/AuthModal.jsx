// File: src/components/modals/AuthModal.jsx
import React, { useState } from 'react';
import { Icons } from '../Icons.jsx';
import { AuthService } from '../../js/services/auth.js';
import { FormField } from '../common/FormField.jsx';

export const AuthModal = ({
    isOpen,
    onClose,
    currentUser,
    activeBrand,
    onLoginSuccess
}) => {
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState(null);

    if (!isOpen) return null;

    const quickAccounts = [
        { username: 'admin', label: '👑 Super Admin (Ary)', role: 'SUPER_ADMIN', desc: 'Akses seluruh brand & switcher' },
        { username: 'homeputra', label: '🏡 Homeputra Interior', role: 'MARKETING_ADMIN', desc: 'Akun Admin Marketing Homeputra' },
        { username: 'heya', label: '🌿 Heya Interior', role: 'MARKETING_ADMIN', desc: 'Akun Admin Marketing Heya' },
        { username: 'putra', label: '🔨 Putra Interior', role: 'MARKETING_ADMIN', desc: 'Akun Admin Workshop Putra' },
        { username: 'kurnia', label: '💎 Kurnia Interior', role: 'MARKETING_ADMIN', desc: 'Akun Admin Eksklusif Kurnia' }
    ];

    const handleQuickLogin = (uname) => {
        try {
            setAuthError(null);
            const session = AuthService.login(uname, 'password123');
            onLoginSuccess(session);
            onClose();
        } catch (err) {
            setAuthError(err.message);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            setAuthError(null);
            const session = AuthService.login(usernameInput, passwordInput);
            onLoginSuccess(session);
            onClose();
        } catch (err) {
            setAuthError(err.message);
        }
    };

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto safe-padding-bottom safe-padding-top"
            onClick={onClose}
        >
            <div 
                className="bg-[#15151a] border border-[#26262d] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 my-auto max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#26262d] pb-4">
                    <div>
                        <h3 className="serif-font font-bold text-base sm:text-lg text-white flex items-center gap-2">
                            <Icons.Key /> Masuk & Ganti Akun Admin
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Sistem Multi-Brand: Setiap admin terisolasi pada brand masing-masing.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white font-bold p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg" aria-label="Tutup modal">✕</button>
                </div>

                {authError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 flex items-center gap-2">
                        <Icons.AlertTriangle />
                        <span>{authError}</span>
                    </div>
                )}

                {/* Sesi Saat Ini */}
                <div className="bg-[#1b1b22] border border-[#2a2a34] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Akun Aktif Saat Ini:</span>
                        <div className="text-sm font-bold text-white mt-0.5">{currentUser?.fullName}</div>
                        <div className="text-xs text-[#c5a059] font-medium">Brand: {activeBrand?.brandName}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {currentUser?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : 'Marketing'}
                    </span>
                </div>

                {/* Switch Cepat 1-Klik */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Ganti Cepat Akun Admin Marketing:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickAccounts.map(acc => (
                            <button
                                key={acc.username}
                                type="button"
                                onClick={() => handleQuickLogin(acc.username)}
                                className={`p-3 rounded-2xl border text-left transition-all min-h-[48px] touch-manipulation active:scale-95 ${
                                    currentUser?.username === acc.username 
                                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white shadow-md' 
                                        : 'bg-[#181820] hover:bg-[#202028] border-[#282832] text-zinc-300'
                                }`}
                            >
                                <div className="font-bold text-xs flex items-center justify-between">
                                    <span>{acc.label}</span>
                                    {currentUser?.username === acc.username && <span className="text-xs text-[#c5a059]">✓</span>}
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{acc.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Login Kustom */}
                <form onSubmit={handleFormSubmit} className="pt-2 border-t border-[#26262d] space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Atau Masuk dengan Kredensial Khusus:
                    </div>
                    <FormField label="Username atau Email">
                        <input 
                            type="text" 
                            placeholder="admin / homeputra / heya" 
                            value={usernameInput} 
                            onChange={(e) => setUsernameInput(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 min-h-[44px]"
                        />
                    </FormField>
                    <FormField label="Password">
                        <input 
                            type="password" 
                            placeholder="password123" 
                            value={passwordInput} 
                            onChange={(e) => setPasswordInput(e.target.value)} 
                            className="w-full bg-[#1b1b22] border border-[#26262d] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 min-h-[44px]"
                        />
                    </FormField>
                    <button 
                        type="submit" 
                        className="gold-btn w-full py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#c5a059]/25 min-h-[44px] touch-manipulation active:scale-95"
                    >
                        Masuk Akun
                    </button>
                </form>
            </div>
        </div>
    );
};
