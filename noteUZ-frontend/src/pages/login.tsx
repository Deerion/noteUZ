import Head from 'next/head';
import {FormEvent, useState} from 'react';

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
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({email, password}),
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
        <>
            <Head>
                <title>NoteUZ — Logowanie</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                />
            </Head>

            <main style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo} aria-hidden>
                                             <span
                                                 className="material-symbols-outlined"
                                                 style={{fontSize: 26, color: 'white', lineHeight: 1}}
                                                 aria-hidden
                                             >
                                                 menu_book
                                             </span>
                        </div>
                        <h1 style={styles.brandTitle}>Logowanie</h1>
                    </div>

                    <form onSubmit={onSubmit} style={styles.form}>
                        <label style={styles.label}>
                            <span style={styles.labelText}>E‑mail</span>
                            <input
                                type="email"
                                placeholder="jan@przyklad.pl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </label>

                        <label style={styles.label}>
                            <span style={styles.labelText}>Hasło</span>
                            <input
                                type="password"
                                placeholder="Twoje hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                        >
                            {loading ? 'Logowanie…' : 'Zaloguj'}
                        </button>

                        {err && <p role="alert" style={styles.error}>{err}</p>}
                    </form>
                </div>
            </main>
        </>
    );
}

const styles: { [k: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
        background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)',
        color: 'var(--foreground, #0f172a)',
    },
    card: {
        width: '100%',
        maxWidth: 420,
        background: 'white',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
        padding: 28,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(79,70,229,0.12)',
        flexShrink: 0,
    },
    brandTitle: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700,
        color: '#0f172a',
    },
    form: {
        display: 'grid',
        gap: 12,
    },
    label: {
        display: 'block',
    },
    labelText: {
        display: 'block',
        fontSize: 13,
        marginBottom: 6,
        color: '#334155',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #e6eef8',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        background: '#fbfdff',
    },
    button: {
        marginTop: 6,
        padding: '10px 12px',
        borderRadius: 10,
        border: 'none',
        background: '#ff7a18',
        color: 'white',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: 15,
        boxShadow: '0 8px 22px rgba(255,122,24,0.16)',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'default',
    },
    error: {
        margin: 0,
        marginTop: 6,
        color: '#c62b1f',
        fontSize: 13,
    },
};