// src/pages/register.tsx
import Head from 'next/head';
import Link from 'next/link';
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import type HCaptcha from '@hcaptcha/react-hcaptcha';

// Importy MUI
// Zachowujemy Twój styl importów (z głównego pakietu), skoro to działało
import {
    Box, Paper, Typography, TextField, Button as MuiButton,
    CircularProgress, useTheme, Checkbox, FormControlLabel, Fade, Button
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
// Dodajemy tylko nową ikonę dla sukcesu
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

// Interfejs propsów (Bez zmian)
interface HCaptchaProps {
    sitekey: string;
    languageOverride?: string;
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    theme?: 'light' | 'dark';
}

// Rzutowanie wyniku dynamic() (Bez zmian - skoro to działało, nie ruszamy)
const HCaptchaComponent = dynamic(
    () => import('@hcaptcha/react-hcaptcha'),
    { ssr: false }
) as React.ComponentType<HCaptchaProps & React.RefAttributes<HCaptcha>>;

export default function RegisterPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    const [captchaKey, setCaptchaKey] = useState(0);

    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [accept, setAccept] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // NOWY STAN: Czy rejestracja się udała?
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setErr(null);

        if (!accept) { setErr(t('error_terms') || 'Musisz zaakceptować regulamin.'); return; }
        if (displayName.length < 2) { setErr(t('error_username_short') || 'Nazwa użytkownika musi mieć min. 2 znaki.'); return; }
        if (password.length < 8) { setErr(t('error_password_short') || 'Hasło musi mieć min. 8 znaków.'); return; }
        if (password !== confirm) { setErr(t('error_passwords_match') || 'Hasła nie są takie same.'); return; }
        if (!captchaToken) { setErr(t('captcha_required') || 'Musisz potwierdzić, że nie jesteś robotem'); return; }

        setLoading(true);

        try {
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

                setCaptchaToken('');
                setCaptchaKey((prev) => prev + 1);

                setLoading(false);
                return;
            }

            // SUKCES: Tutaj zmieniamy logikę. Zamiast przekierowania -> pokazujemy ekran sukcesu.
            setLoading(false);
            setSuccess(true);
            // router.push(...) <- To usunęliśmy

        } catch (error) {
            console.error('Registration error:', error);
            setErr(t('service_unavailable') || 'Serwis niedostępny. Spróbuj ponownie później.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — {t('register')}</title>
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
                    {success ? (
                        /* ===== EKRAN SUKCESU (DODANY) ===== */
                        <Fade in={true}>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Box sx={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    // Używamy kolorów bezpośrednio lub theme, bez funkcji alpha() importowanej z zewnątrz
                                    bgcolor: theme.palette.mode === 'light' ? '#ecfdf5' : 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981', // Zielony kolor sukcesu
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mx: 'auto', mb: 3
                                }}>
                                    <MarkEmailReadIcon sx={{ fontSize: 40 }} />
                                </Box>

                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    {t('registration_success_title') || "Sprawdź skrzynkę!"}
                                </Typography>

                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    {t('registration_success_desc') || "Wysłaliśmy link aktywacyjny."}
                                </Typography>

                                <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '8px', mb: 4 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        {t('spam_warning') || "Sprawdź folder Spam."}
                                    </Typography>
                                </Box>

                                <Link href="/login" legacyBehavior passHref>
                                    <MuiButton
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        sx={{ fontWeight: 700, borderRadius: '10px' }}
                                    >
                                        {t('go_to_login') || "Zaloguj się"}
                                    </MuiButton>
                                </Link>
                            </Box>
                        </Fade>
                    ) : (
                        /* ===== STARY, DOBRY FORMULARZ (BEZ ZMIAN) ===== */
                        <>
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
                                    label={t('username') || "Nazwa użytkownika"}
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />

                                <TextField
                                    label={t('password') || "Hasło"}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />

                                <TextField
                                    label={t('repeat_password') || "Powtórz hasło"}
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={accept}
                                            onChange={(e) => setAccept(e.target.checked)}
                                            color="primary"
                                            sx={{ padding: '0 9px 0 0' }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.secondary', fontWeight: 500 }}>
                                            {t('accept_terms') || "Akceptuję regulamin"}
                                        </Typography>
                                    }
                                    sx={{ margin: 0, marginTop: 1, '& .MuiFormControlLabel-label': { margin: 0 } }}
                                />

                                <Box sx={{ marginTop: '8px' }}>
                                    <HCaptchaComponent
                                        key={captchaKey}
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
                                    {loading ? <CircularProgress size={24} color="inherit" /> : t('create_account') || 'Utwórz konto'}
                                </MuiButton>

                                {err && (
                                    <Typography variant="body2" sx={{ marginTop: 0.5, color: theme.palette.error.main, fontSize: '13px' }}>
                                        {err}
                                    </Typography>
                                )}
                            </Box>

                            <Typography variant="body2" sx={{ marginTop: 2, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
                                {t('has_account') || "Masz już konto?"}
                                <Link href="/login" legacyBehavior passHref>
                                    <a style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }}>
                                        {t('login_now') || "Zaloguj się"}
                                    </a>
                                </Link>
                            </Typography>
                        </>
                    )}
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