import Head from 'next/head';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import s from '../styles/Login.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr(null);

        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setErr('Nieprawidłowy e‑mail lub hasło');
                } else {
                    setErr(`API ${res.status}`);
                }
                setLoading(false);
                return;
            }

            setLoading(false);
            router.push('/'); // przekierowanie na stronę główną po zalogowaniu
        } catch {
            setErr('Serwis niedostępny. Spróbuj ponownie później.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — Logowanie</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"/>
            </Head>

            <main className={s.page}>
                <div className={s.card}>
                    <div className={s.header}>
                        <div className={s.logo} aria-hidden>
              <span className="material-symbols-outlined" style={{fontSize: 26, color: 'white', lineHeight: 1}} aria-hidden>
                menu_book
              </span>
                        </div>
                        <h1 className={s.brandTitle}>Logowanie</h1>
                    </div>

                    <form onSubmit={onSubmit} className={s.form}>
                        <label className={s.label}>
                            <span className={s.labelText}>E‑mail</span>
                            <input
                                type="email"
                                placeholder="jan@przyklad.pl"
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
                                placeholder="Twoje hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="current-password"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`${s.button} ${loading ? s.buttonDisabled : ''}`}
                        >
                            {loading ? 'Logowanie…' : 'Zaloguj'}
                        </button>

                        {err && <p role="alert" className={s.error}>{err}</p>}
                    </form>
                </div>
            </main>
        </>
    );
}
