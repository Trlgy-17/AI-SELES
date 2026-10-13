// File: src/components/modals/AuthModal.jsx
import React, { useState } from 'react';
import { UserRound, LogOut, CircleAlert, KeyRound } from 'lucide-react';
import { FormField } from '../common/FormField.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Badge } from '../ui/Surface.jsx';
import { AuthApi } from '../../js/services/api.js';

const ROLE_LABELS = { SUPER_ADMIN: 'Super Admin', OWNER: 'Owner', SUPERVISOR: 'Supervisor', MARKETING_ADMIN: 'Admin Marketing', SALES: 'Sales' };

export const AuthModal = ({ isOpen, onClose, session, showToast, onLogout }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const user = session?.user;

    const changePassword = async (e) => {
        e.preventDefault();
        setError(null);
        if (newPassword.length < 10) {
            setError('Password baru minimal 10 karakter.');
            return;
        }
        setSaving(true);
        try {
            await AuthApi.changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            showToast('Password berhasil diganti. Sesi di perangkat lain sudah diakhiri.', 'success');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={UserRound}
            title="Akun & sesi"
            size="md"
            className="max-h-[90dvh]"
            bodyClassName="overflow-y-auto space-y-5"
            footer={
                <Button variant="danger" icon={LogOut} onClick={onLogout} className="sm:mr-auto">
                    Keluar
                </Button>
            }
        >
            <div className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3.5 py-3">
                <div className="min-w-0">
                    <div className="truncate text-body font-medium text-fg">{user?.fullName}</div>
                    <div className="truncate text-caption text-fg-3">{user?.email} · {session?.activeBrand?.brandName}</div>
                </div>
                <Badge variant={user?.role === 'SUPER_ADMIN' ? 'primary' : 'neutral'}>{ROLE_LABELS[user?.role] || user?.role}</Badge>
            </div>

            <form onSubmit={changePassword} className="space-y-3">
                <div className="flex items-center gap-2 text-label font-medium text-fg-2">
                    <KeyRound size={14} aria-hidden="true" /> Ganti password
                </div>
                {error && (
                    <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                        <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {error}
                    </div>
                )}
                <FormField label="Password saat ini" htmlFor="pw-current">
                    <Input id="pw-current" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="text-base sm:text-sm" />
                </FormField>
                <FormField label="Password baru" htmlFor="pw-new" helperText="Minimal 10 karakter.">
                    <Input id="pw-new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-base sm:text-sm" />
                </FormField>
                <Button type="submit" variant="secondary" loading={saving} disabled={!currentPassword || !newPassword}>
                    Simpan password
                </Button>
            </form>
        </Modal>
    );
};
