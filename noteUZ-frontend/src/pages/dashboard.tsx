// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
    Box, Container, Typography, Grid, CircularProgress, useTheme
} from '@mui/material';

import { ProfileCard } from '@/components/Dashboard/ProfileCard';
import { AccountDetailsCard } from '@/components/Dashboard/AccountDetailsCard';
import { FriendsSection } from '@/components/Dashboard/FriendsSection';
import { GroupInvitationsSection } from '@/components/Dashboard/GroupInvitationsSection';
import { UserData } from '@/types/User';
import { Navbar } from '@/components/landing/Navbar'; // <--- UŻYWAMY GŁÓWNEGO NAVBARA

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Dashboard() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false); // Do obsługi wylogowania

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
        setBusy(true);
        try {
            await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
            router.push('/');
        } finally {
            setBusy(false);
        }
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
                display: 'flex',
                flexDirection: 'column',
                pb: 8
            }}>
                {/* GLOBALNY NAVBAR ZAMIAST LOKALNEGO */}
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    busy={busy}
                    hideSearch={true} // Na dashboardzie szukajka może być zbędna, chyba że chcesz szukać globalnie
                />

                <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
                    <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 4, px: 1 }}>
                        {t('your_panel')}
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <ProfileCard user={user} />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <AccountDetailsCard user={user} />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <GroupInvitationsSection />
                    </Box>

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