import { FormEvent, useState } from 'react';
import { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginPage() {
    const t = useTranslations('Login');
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
                setErr(t('invalidCredentials'));
            } else {
                setErr(`${t('apiError')} ${res.status}`);
            }
            setLoading(false);
            return;
        }

        window.location.href = '/notes';
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>{t('title')}</h1>
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
                <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? t('loggingIn') : t('loginButton')}
                </button>
                {err && <p style={{ color: 'crimson' }}>{err}</p>}
            </form>
        </main>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        messages: (await import(`../messages/${locale}.json`)).default,
        locale
    }
});
