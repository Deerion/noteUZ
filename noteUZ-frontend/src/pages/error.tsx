import Head from 'next/head';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React from 'react';

const titles: Record<string, string> = {
    '401': 'Brak uprawnień',
    '403': 'Dostęp zabroniony',
    '404': 'Nie znaleziono',
    '500': 'Błąd serwera',
    '503': 'Serwis niedostępny',
};



export default function ErrorPage() {
    const { query, push } = useRouter();
    const code = (query.code as string) ?? '500';
    const msg = (query.msg as string) ?? 'Wystąpił błąd';
    const title = titles[code] ?? 'Błąd';

    return (
        <>
            <Head>
                <title>{title} — {code}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <main style={page}>
                <div style={card}>
                    <h1 style={h1}>{title} ({code})</h1>
                    <p style={p}>{msg}</p>

                    <div style={row}>
                        {code === '401' && (
                            <Link href="/login" style={btnSecondary}>Zaloguj się</Link>
                        )}

                        {code === '503' && (
                            <button onClick={() => push('/login')} style={btnPrimary}>
                                Spróbuj ponownie
                            </button>
                        )}

                        <Link href="/" style={btnGhost}>Strona główna</Link>
                    </div>
                </div>
            </main>
        </>
    );
}

/* proste style lokalne tylko dla tej strony */
const page: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)',
    padding: 24,
    color: '#0f172a',
    fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
};

const card: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: 'white',
    borderRadius: 14,
    boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
    padding: 24,
};

const h1: React.CSSProperties = { margin: 0, fontSize: 22 };
const p: React.CSSProperties = { marginTop: 10, color: '#334155' };

const row: React.CSSProperties = { display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' };
const btnPrimary: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 10,
    border: 'none',
    background: '#ff7a18',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
};
const btnSecondary: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 10,
    background: '#eef2ff',
    color: '#1e293b',
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid #c7d2fe',
};
const btnGhost: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 10,
    background: 'transparent',
    color: '#334155',
    textDecoration: 'none',
    border: '1px solid rgba(15,23,42,0.06)',
};
