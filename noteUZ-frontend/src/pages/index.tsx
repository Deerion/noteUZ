// src/pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Importy MUI
// W MUI v6 "Grid" to już nowoczesny Grid v2
import {
    Box, AppBar, Toolbar, Typography, IconButton, InputBase,
    Container, Button as MuiButton, Card, useTheme, Grid
} from '@mui/material';

import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Home() {
    const { t } = useTranslation('common');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [busy, setBusy] = useState(false);
    const theme = useTheme();

    async function refreshSession() {
        try {
            const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
            setIsLoggedIn(res.ok);
            return res.ok;
        } catch {
            setIsLoggedIn(false);
            return false;
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            await refreshSession();
            if (!mounted) return;
        })();
        return () => { mounted = false; };
    }, []);

    async function onLogout() {
        setBusy(true);
        try {
            await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
            const sessionOk = await refreshSession();
            if (!sessionOk) {
                setIsLoggedIn(false);
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }
        } finally {
            setBusy(false);
        }
    }

    // Wspólne style dla przycisków
    const ctaButtonStyle = {
        padding: '12px 18px',
        borderRadius: '10px',
        fontWeight: 600,
        textTransform: 'none',
        textDecoration: 'none'
    };

    const secondaryLinkStyle = {
        padding: '8px 10px',
        borderRadius: '10px',
        background: 'transparent',
        color: '#334155',
        textDecoration: 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        fontWeight: 600,
        display: 'inline-block',
        '&:hover': {
            background: theme.palette.background.paper,
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
        },
    };

    return (
        <>
            <Head>
                <title>NoteUZ — Home</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <Box component="main" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <AppBar
                    position="sticky"
                    color="inherit"
                    elevation={0}
                    sx={{
                        borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgba(15,23,42,0.04)' : theme.palette.divider}`,
                        backdropFilter: 'blur(6px)',
                        backgroundColor: 'var(--nav-bg)',
                        zIndex: 40,
                    }}
                >
                    <Toolbar
                        disableGutters
                        sx={{
                            padding: '10px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <IconButton aria-label="menu" color="inherit" sx={{ padding: '8px', borderRadius: '8px' }}>
                                <MenuIcon fontSize="small" />
                            </IconButton>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 20px rgba(79,70,229,0.12)',
                                    flexShrink: 0,
                                }}>
                                    <MenuBookIcon sx={{ fontSize: 26, color: 'white' }} />
                                </Box>
                                <Typography variant="h6" component="h1" fontWeight={700} sx={{ fontSize: '18px' }}>
                                    NoteUZ
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
                            <InputBase
                                placeholder={t('search')}
                                sx={{
                                    width: '100%',
                                    maxWidth: 760,
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    border: `1px solid rgba(15,23,42,0.06)`,
                                    backgroundColor: 'background.default',
                                    boxShadow: '0 6px 16px rgba(2,6,23,0.04)',
                                    transition: 'all 0.3s ease',
                                    '&.Mui-focused': {
                                        borderColor: theme.palette.secondary.main,
                                        boxShadow: '0 6px 20px rgba(79, 70, 229, 0.15)',
                                    },
                                    color: 'text.primary',
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                            <LanguageSwitcher />
                            <ThemeToggle />
                            {isLoggedIn ? (
                                <MuiButton variant="contained" color="primary" onClick={onLogout} disabled={busy} size="small"
                                           sx={{ padding: '8px 12px', minWidth: 'auto', lineHeight: 1.2 }}>
                                    {busy ? '...' : t('logout')}
                                </MuiButton>
                            ) : (
                                <>
                                    <MuiButton
                                        component={Link}
                                        href="/register"
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        sx={{ padding: '8px 12px', minWidth: 'auto', lineHeight: 1.2 }}
                                    >
                                        {t('register')}
                                    </MuiButton>
                                    <MuiButton
                                        component={Link}
                                        href="/login"
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        sx={{ padding: '8px 12px', minWidth: 'auto', lineHeight: 1.2 }}
                                    >
                                        {t('login')}
                                    </MuiButton>
                                </>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container
                    maxWidth="lg"
                    sx={{
                        padding: 3,
                        margin: '24px auto',
                        boxSizing: 'border-box'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 3,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            padding: 3.5,
                            borderRadius: '12px',
                            background: 'var(--page-gradient)',
                            boxShadow: '0 8px 30px rgba(2,6,23,0.04)',
                            transition: 'background 0.3s ease',
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 260 }}>
                            <Typography variant="h2" component="h2" gutterBottom>
                                {t('welcome')}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    marginTop: 1,
                                    color: 'text.secondary',
                                    fontSize: '16px',
                                    maxWidth: 640,
                                    lineHeight: 1.6
                                }}
                            >
                                {t('description')}
                            </Typography>

                            <Box sx={{ marginTop: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                {isLoggedIn ? (
                                    <MuiButton
                                        component={Link}
                                        href="/notes"
                                        variant="contained"
                                        color="primary"
                                        sx={ctaButtonStyle}
                                    >
                                        {t('notes')}
                                    </MuiButton>
                                ) : (
                                    <MuiButton
                                        component={Link}
                                        href="/register"
                                        variant="contained"
                                        color="primary"
                                        sx={ctaButtonStyle}
                                    >
                                        {t('register')}
                                    </MuiButton>
                                )}
                                <Box
                                    component="a"
                                    href="#features"
                                    sx={secondaryLinkStyle}
                                >
                                    {t('features')}
                                </Box>
                            </Box>
                        </Box>

                        <MuiButton onClick={async () => {
                            const r = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
                            alert('ME status: ' + r.status);
                        }} style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--paper)',
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}>
                            Sprawdź sesję
                        </MuiButton>

                        <Box sx={{ width: 320, minWidth: 220 }}>
                            <Box sx={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(2,6,23,0.06)',
                                border: '1px solid',
                                borderColor: theme.palette.divider,
                                background: 'var(--background)',
                                transition: 'all 0.3s ease',
                            }}>
                                <Box sx={{ height: '10px', background: 'linear-gradient(90deg, #06b6d4, #4f46e5)' }}/>
                                <Box sx={{ padding: 2, backgroundColor: 'background.default' }}>
                                    <Box sx={{
                                        backgroundColor: theme.palette.mode === 'light' ? '#fbfdff' : theme.palette.background.paper,
                                        borderRadius: '8px',
                                        padding: 1.5,
                                        transition: 'background-color 0.3s ease',
                                    }}>
                                        <Box sx={{ height: '10px', background: 'linear-gradient(90deg, rgba(79,70,229,0.12), rgba(6,182,212,0.06))', borderRadius: '6px', marginBottom: '8px' }}/>
                                        <Box sx={{ width: '80%', height: '10px', background: 'linear-gradient(90deg, rgba(79,70,229,0.12), rgba(6,182,212,0.06))', borderRadius: '6px', marginBottom: '8px' }}/>
                                        <Box sx={{ width: '60%', height: '10px', background: 'linear-gradient(90deg, rgba(79,70,229,0.12), rgba(6,182,212,0.06))', borderRadius: '6px', marginBottom: '8px' }}/>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box id="features" sx={{ marginTop: 4, paddingTop: 1 }}>
                        <Typography variant="h6" component="h3" fontWeight={700} sx={{ marginBottom: 1.5 }}>
                            {t('features')}
                        </Typography>
                        {/* NAPRAWA DLA MUI v6:
                            1. container zostaje (dla spacing).
                            2. item znika.
                            3. xs/md zmieniamy na obiekt size={{...}}.
                        */}
                        <Grid container spacing={1.5}>
                            {['✦', '⚡', '🔒'].map((icon, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: '10px',
                                            padding: 2,
                                            boxShadow: '0 8px 22px rgba(2,6,23,0.04)',
                                            transition: 'all 0.3s ease',
                                            backgroundColor: 'background.paper',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 28px rgba(2,6,23,0.08)',
                                            }
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontSize: '20px', marginBottom: 1 }}>{icon}</Typography>
                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                            {t(`feature_${index === 0 ? 'simple' : index === 1 ? 'speed' : 'security'}_title`)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.4 }}>
                                            {t(`feature_${index === 0 ? 'simple' : index === 1 ? 'speed' : 'security'}_desc`)}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
                <Box component="footer" sx={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '18px 0' }}>
                    © {new Date().getFullYear()} NoteUZ
                </Box>
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