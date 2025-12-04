// src/pages/register.tsx
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Importy MUI
import { Box, Paper, Typography, TextField, Button as MuiButton, CircularProgress, useTheme, Checkbox, FormControlLabel } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? '';

export default function RegisterPage() {
    const { t } = useTranslation('common'); // <-- Hook
    const router = useRouter();
    const captchaRef = useRef<any>(null);
    const theme = useTheme();

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

        // Tutaj też warto dodać klucze do tłumaczeń w przyszłości
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
                captchaRef.current.resetCaptcha();
                setLoading(false);
                return;
            }

            setLoading(false);
            router.push(`/login?email=${encodeURIComponent(email)}`);

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
                    {/* Header: Logo i Tytuł */}
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
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '13px',
                                        color: 'text.secondary',
                                        fontWeight: 500
                                    }}
                                >
                                    {t('accept_terms') || "Akceptuję regulamin"}
                                </Typography>
                            }
                            sx={{
                                margin: 0,
                                marginTop: 1,
                                '& .MuiFormControlLabel-label': { margin: 0 }
                            }}
                        />

                        {/* hCaptcha Widget */}
                        <Box sx={{ marginTop: '8px' }}>
                            <HCaptcha
                                ref={captchaRef}
                                sitekey={HCAPTCHA_SITE_KEY}
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