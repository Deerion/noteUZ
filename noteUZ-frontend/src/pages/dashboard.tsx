// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
    Box, Container, Typography, Grid, CircularProgress
} from '@mui/material';

import { ProfileCard } from '@/components/Dashboard/ProfileCard';
import { AccountDetailsCard } from '@/components/Dashboard/AccountDetailsCard';
import { FriendsSection } from '@/components/Dashboard/FriendsSection';
import { GroupInvitationsSection } from '@/components/Dashboard/GroupInvitationsSection';
import { UpcomingEventsSection } from '@/components/Dashboard/UpcomingEventsSection';
import { UserData } from '@/types/User';
import { Navbar } from '@/components/landing/Navbar';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        apiFetch<UserData>('/api/auth/me')
            .then(data => setUser(data))
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false));
    }, [router]);

    async function handleLogout() {
        setBusy(true);
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' });
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
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    busy={busy}
                    hideSearch={true}
                />

                <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
                    <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 4, px: 1 }}>
                        {t('your_panel')}
                    </Typography>

                    <Grid container spacing={3}>

                        {/* 1. GÓRA: Profil (4) i Dane (8) - RÓWNA WYSOKOŚĆ */}
                        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                            <Box sx={{ display: 'flex', flexGrow: 1, '& > *': { flexGrow: 1 } }}>
                                <ProfileCard user={user} />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
                            <Box sx={{ display: 'flex', flexGrow: 1, '& > *': { flexGrow: 1 } }}>
                                <AccountDetailsCard user={user} />
                            </Box>
                        </Grid>

                        {/* 2. ŚRODEK: Wydarzenia (Pełna szerokość - logicznie nad zaproszeniami) */}
                        <Grid size={{ xs: 12 }}>
                            <UpcomingEventsSection />
                        </Grid>

                        {/* 3. ŚRODEK: Zaproszenia do grup (Pełna szerokość) */}
                        <Grid size={{ xs: 12 }}>
                            <GroupInvitationsSection />
                        </Grid>

                        {/* 4. DÓŁ: Znajomi (Pełna szerokość) */}
                        <Grid size={{ xs: 12 }}>
                            <FriendsSection user={user} />
                        </Grid>

                    </Grid>
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