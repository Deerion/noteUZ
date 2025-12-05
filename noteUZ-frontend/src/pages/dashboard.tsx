// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import {
    Box, Container, Typography, Grid, Button, CircularProgress, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';

import { ProfileCard } from '@/components/Dashboard/ProfileCard';
import { AccountDetailsCard } from '@/components/Dashboard/AccountDetailsCard';
import { FriendsSection } from '@/components/Dashboard/FriendsSection';
import { UserData } from '@/types/User';

import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Dashboard() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/auth/me`, { credentials: 'include' })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    router.push('/login');
                }
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    async function handleLogout() {
        await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        router.push('/');
    }

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--page-gradient)' }}>
                <CircularProgress size={50} thickness={4} />
            </Box>
        );
    }

    if (!user) return null;

    return (
        <>
            <Head>
                <title>{t('dashboard_title')} — NoteUZ</title>
            </Head>

            <Box sx={{
                minHeight: '100vh',
                background: 'var(--page-gradient)',
                pb: 8
            }}>
                <Box component="nav" sx={{
                    position: 'sticky', top: 0, zIndex: 100, px: { xs: 2, md: 4 }, py: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 10, 0.7)',
                    borderBottom: '1px solid', borderColor: 'divider'
                }}>
                    <Link href="/" legacyBehavior passHref>
                        <Button startIcon={<ArrowBackIcon />} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}>
                            {t('back_home')}
                        </Button>
                    </Link>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ThemeToggle />
                        <LanguageSwitcher />

                        <Button
                            onClick={handleLogout}
                            color="error"
                            variant="outlined"
                            size="small"
                            startIcon={<LogoutIcon />}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, ml: 1 }}
                        >
                            {t('logout')}
                        </Button>
                    </Box>
                </Box>

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 4, px: 1 }}>
                        {t('your_panel')}
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <ProfileCard user={user} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            <AccountDetailsCard user={user} />
                        </Grid>
                    </Grid>

                    <FriendsSection user={user} />

                </Container>
            </Box>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
        },
    };
};