import Head from 'next/head';
import { FormEvent, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import s from '../styles/Register.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

export default function RegisterPage() {
    const router = useRouter();
    const captchaRef = useRef<any>(null);

    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [accept, setAccept] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setErr(null);

        if (!accept) {
            setErr('Musisz zaakceptować regulamin.');
            return;
        }

        if (displayName.length < 2) {
            setErr('Nazwa użytkownika musi mieć min. 2 znaki.');
            return;
        }

        if (displayName.length > 32) {
            setErr('Nazwa użytkownika może mieć max. 32 znaki.');
            return;
        }

        if (password.length < 8) {
            setErr('Hasło musi mieć min. 8 znaków.');
            return;
        }

        if (password.length > 32) {
            setErr('Hasło może mieć max. 32 znaki.');
            return;
        }

        if (password.includes(' ')) {
            setErr('Hasło nie może zawierać spacji.');
            return;
        }

        if (!/\d/.test(password)) {
            setErr('Hasło musi zawierać co najmniej jedną cyfrę.');
            return;
        }

        if (!/[a-z]/.test(password)) {
            setErr('Hasło musi zawierać co najmniej jedną małą literę.');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setErr('Hasło musi zawierać co najmniej jedną wielką literę.');
            return;
        }

        if (password !== confirm) {
            setErr('Hasła nie są takie same.');
            return;
        }

        if (!captchaToken) {
            setErr('Musisz potwierdzić, że nie jesteś robotem');
            return;
        }

        setLoading(true);

        try {
            // Rejestracja z CAPTCHA tokenem
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    displayName,
                    captchaToken,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErr(data.message || `Rejestracja nie powiodła się (HTTP ${res.status}).`);
                setLoading(false);
                return;
            }

            // ✅ Rejestracja OK
            setLoading(false);

            // Przejdź na stronę logowania
            // Możemy tutaj zachować email w URL-u jako query param, żeby automatycznie wypełnić pole
            router.push(`/login?email=${encodeURIComponent(email)}`);

        } catch (error) {
            console.error('Registration error:', error);
            setErr('Serwis niedostępny. Spróbuj ponownie później.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — Rejestracja</title>
            </Head>

            <div className={s.page}>
                <div className={s.card}>
                    <div className={s.header}>
                        <div className={s.logo}>
                            <span style={{ fontSize: '24px', color: 'white' }}>📚</span>
                        </div>
                        <h1 className={s.brandTitle}>NoteUZ</h1>
                    </div>

                    <form onSubmit={onSubmit} className={s.form}>
                        <label className={s.label}>
                            <span className={s.labelText}>E-mail</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="email"
                            />
                        </label>

                        <label className={s.label}>
                            <span className={s.labelText}>Nazwa użytkownika</span>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                className={s.input}
                            />
                        </label>

                        <label className={s.label}>
                            <span className={s.labelText}>Hasło</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="new-password"
                            />
                        </label>

                        <label className={s.label}>
                            <span className={s.labelText}>Powtórz hasło</span>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="new-password"
                            />
                        </label>

                        <label className={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <input
                                type="checkbox"
                                checked={accept}
                                onChange={(e) => setAccept(e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span className={s.labelText} style={{ marginBottom: 0 }}>Akceptuję regulamin</span>
                        </label>

                        {/* hCaptcha Widget */}
                        <div className={s.label} style={{ marginTop: '8px' }}>
                            <HCaptcha
                                ref={captchaRef}
                                sitekey={HCAPTCHA_SITE_KEY}
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => {
                                    setCaptchaToken('');
                                    setErr('CAPTCHA wygasła. Spróbuj ponownie.');
                                }}
                                onError={() => {
                                    setCaptchaToken('');
                                    setErr('Błąd CAPTCHA. Spróbuj ponownie.');
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${s.button} ${(loading || !captchaToken) ? s.buttonDisabled : ''}`}
                            disabled={loading || !captchaToken}
                        >
                            {loading ? 'Rejestrowanie…' : 'Utwórz konto'}
                        </button>

                        {err && <p className={s.error}>{err}</p>}
                    </form>

                    <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                        Masz już konto? <a href="/login" style={{ color: '#ff7a18', textDecoration: 'none', fontWeight: '600' }}>Zaloguj się</a>
                    </p>
                </div>
            </div>
        </>
    );
}
