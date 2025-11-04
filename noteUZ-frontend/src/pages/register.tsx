import Head from 'next/head';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import s from '../styles/Register.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [accept, setAccept] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setErr(null);

        if (!accept) { setErr('Musisz zaakceptować regulamin.'); return; }
        if (displayName.length < 2) { setErr('Nazwa użytkownika musi mieć min. 2 znaki.'); return; }
        if (password.length < 8) { setErr('Hasło musi mieć min. 8 znaków.'); return; }
        if (password !== confirm) { setErr('Hasła nie są takie same.'); return; }

        setLoading(true);
        try {
            // 1) rejestracja z display_name
            const reg = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName }),
            });
            if (!reg.ok) {
                const data = await reg.json();
                setErr(data.message || `Rejestracja nie powiodła się (HTTP ${reg.status}).`);
                setLoading(false);
                return;
            }

            // 2) automatyczne logowanie
            const login = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            if (!login.ok) {
                setErr('Zarejestrowano, ale logowanie nie powiodło się. Zaloguj się ręcznie.');
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
                <title>NoteUZ — Rejestracja</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"/>
            </Head>

            <main className={s.page}>
                <div className={s.card}>
                    <div className={s.header}>
                        <div className={s.logo} aria-hidden>
                            <span className="material-symbols-outlined" style={{ fontSize: 26, color: 'white', lineHeight: 1 }} aria-hidden>
                                menu_book
                            </span>
                        </div>
                        <h1 className={s.brandTitle}>Rejestracja</h1>
                    </div>

                    <form onSubmit={onSubmit} className={s.form}>
                        <label className={s.label}>
                            <span className={s.labelText}>E-mail</span>
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
                            <span className={s.labelText}>Nazwa użytkownika</span>
                            <input
                                type="text"
                                placeholder="Jan Kowalski"
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
                                placeholder="Min. 8 znaków"
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
                                placeholder="Powtórz hasło"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                className={s.input}
                                autoComplete="new-password"
                            />
                        </label>

                        <label className={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                            <span className={s.labelText}>Akceptuję regulamin</span>
                        </label>

                        <button type="submit" disabled={loading} className={`${s.button} ${loading ? s.buttonDisabled : ''}`}>
                            {loading ? 'Rejestrowanie…' : 'Utwórz konto'}
                        </button>

                        {err && <p role="alert" className={s.error}>{err}</p>}
                    </form>
                </div>
            </main>
        </>
    );
}
