// File: src/components/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { CircleAlert, LogIn } from 'lucide-react';
import { BrandMark } from '../Icons.jsx';
import { FormField } from '../common/FormField.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { AuthApi } from '../../js/services/api.js';

export const LoginScreen = ({ onLoggedIn }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!identifier.trim() || !password) {
            setError('Isi username/email dan password.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const session = await AuthApi.login(identifier.trim(), password);
            onLoggedIn(session);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-bg px-4 py-10 text-fg">
            <main className="w-full max-w-sm">
                <div className="mb-8 flex items-center gap-3">
                    <BrandMark size={40} />
                    <div>
                        <div className="text-h3 font-semibold">Nacira AI</div>
                        <div className="text-caption text-fg-muted">Asisten Sales Cerdas</div>
                    </div>
                </div>
                <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-floating" noValidate>
                    <div>
                        <h1 className="text-h2 font-semibold">Masuk</h1>
                        <p className="mt-1 text-body-sm text-fg-3">Gunakan akun yang diberikan admin.</p>
                    </div>
                    {error && (
                        <div className="flex items-start gap-2 rounded-sm border border-danger/25 bg-danger/10 px-3 py-2.5 text-body-sm text-red-300" role="alert">
                            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                            {error}
                        </div>
                    )}
                    <FormField label="Username atau email" htmlFor="login-identifier">
                        <Input id="login-identifier" autoComplete="username" autoFocus value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="text-base sm:text-sm" />
                    </FormField>
                    <FormField label="Password" htmlFor="login-password">
                        <Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-base sm:text-sm" />
                    </FormField>
                    <Button type="submit" variant="primary" className="w-full" icon={LogIn} loading={loading}>
                        {loading ? 'Memeriksa…' : 'Masuk'}
                    </Button>
                </form>
                <p className="mt-6 text-center text-caption text-fg-muted">Lupa password? Hubungi Super Admin.</p>
            </main>
        </div>
    );
};
