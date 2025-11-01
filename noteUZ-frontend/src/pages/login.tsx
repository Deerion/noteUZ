import { FormEvent, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr(null);

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

        window.location.href = '/notes';
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Logowanie</h1>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logowanie...' : 'Zaloguj'}
                </button>
                {err && <p style={{ color: 'crimson' }}>{err}</p>}
            </form>
        </main>
    );
}
