// src/pages/login.tsx
import Head from 'next/head';
import Link from 'next/link';
import React, { FormEvent, useState, useRef } from 'react'; // Dodano React
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Importujemy TYP instancji
import type HCaptcha from '@hcaptcha/react-hcaptcha';

// Importy MUI
import { Box, Paper, Typography, TextField, Button as MuiButton, CircularProgress, useTheme } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

// 1. Definiujemy interfejs propsów
interface HCaptchaProps {
    sitekey: string;
    languageOverride?: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    theme?: 'light' | 'dark';
}

// 2. NAPRAWA: Rzutujemy wynik dynamic() na ComponentType z odpowiednimi propsami i refem.
// To omija błąd TS2345 dotyczący niezgodności struktury modułu.
const HCaptchaComponent = dynamic(
    () => import('@hcaptcha/react-hcaptcha'),
    { ssr: false }
) as React.ComponentType<HCaptchaProps & React.RefAttributes<HCaptcha>>;

export default function LoginPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    const captchaRef = useRef<HCaptcha>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr(null);

        if (!captchaToken) {
            setErr(t('captcha_required') || 'Musisz potwierdzić, że nie jesteś robotem');
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
                    setErr(t('invalid_credentials') || 'Nieprawidłowy e‑mail lub hasło');
                } else if (res.status === 400) {
                    const data = await res.json();
                    setErr(data.message || t('captcha_error') || 'Błąd walidacji CAPTCHA');
                    if (captchaRef.current) {
                        captchaRef.current.resetCaptcha();
                    }
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
            setErr(t('service_unavailable') || 'Serwis niedostępny. Spróbuj ponownie później.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — {t('login')}</title>
            </Head>

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 3,
                    background: 'var(--page-gradient)',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        borderRadius: '14px',
                        padding: 3.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 1.5 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.12)',
                            flexShrink: 0,
                        }}>
                            <MenuBookIcon sx={{ fontSize: '26px', color: 'white' }} />
                        </Box>
                        <Typography variant="h5" component="h1" fontWeight={700}>
                            NoteUZ
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 1.5 }}>
                        <TextField
                            label={t('email') || "E-mail"}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

                        <TextField
                            label={t('password') || "Hasło"}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />

                        <Box sx={{ marginTop: '8px' }}>
                            <HCaptchaComponent
                                ref={captchaRef}
                                sitekey={HCAPTCHA_SITE_KEY}
                                languageOverride={router.locale}
                                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => {
                                    setCaptchaToken('');
                                    setErr(t('captcha_expired') || 'CAPTCHA wygasła. Spróbuj ponownie.');
                                }}
                                onError={() => {
                                    setCaptchaToken('');
                                    setErr(t('captcha_error') || 'Błąd CAPTCHA. Spróbuj ponownie.');
                                }}
                            />
                        </Box>

                        <MuiButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !captchaToken}
                            sx={{
                                marginTop: 1,
                                padding: '10px 12px',
                                fontWeight: 600,
                                fontSize: '15px',
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : t('login_action') || 'Zaloguj'}
                        </MuiButton>

                        {err && (
                            <Typography variant="body2" sx={{ marginTop: 0.5, color: theme.palette.error.main, fontSize: '13px' }}>
                                {err}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="body2" sx={{ marginTop: 2, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
                        {t('no_account') || "Nie masz konta?"}
                        <Link href="/register" legacyBehavior passHref>
                            <a style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                                {t('register_now') || "Zarejestruj się"}
                            </a>
                        </Link>
                    </Typography>
                </Paper>
            </Box>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
        },
    };
};