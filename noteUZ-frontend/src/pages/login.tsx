import Head from 'next/head';
import { FormEvent, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import s from '../styles/Login.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

export default function LoginPage() {
    const router = useRouter();
    const captchaRef = useRef<any>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr(null);

        // Weryfikacja CAPTCHA
        if (!captchaToken) {
            setErr('Musisz potwierdzić, że nie jesteś robotem');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                    captchaToken,
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setErr('Nieprawidłowy e‑mail lub hasło');
                } else if (res.status === 400) {
                    const data = await res.json();
                    setErr(data.message || 'Błąd walidacji CAPTCHA');
                    // Resetuj CAPTCHA
                    captchaRef.current?.resetCaptcha();  // ← Zmień tutaj też
                    setCaptchaToken('');
                } else {
                    setErr(`API ${res.status}`);
                }
                setLoading(false);
                return;
            }

            setLoading(false);
            router.push('/');
        } catch {
            setErr('Serwis niedostępny. Spróbuj ponownie później.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — Logowanie</title>
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
                            <span className={s.labelText}>E‑mail</span>
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
                            <span className={s.labelText}>Hasło</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="current-password"
                            />
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
                            {loading ? 'Logowanie…' : 'Zaloguj'}
                        </button>

                        {err && <p className={s.error}>{err}</p>}
                    </form>

                    <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                        Nie masz konta? <a href="/register" style={{ color: '#ff7a18', textDecoration: 'none', fontWeight: '600' }}>Zarejestruj się</a>
                    </p>
                </div>
            </div>
        </>
    );
}
