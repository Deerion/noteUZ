// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
    Box, Container, Typography, CircularProgress, Alert, AlertTitle
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

                    {/* --- SEKCJA OSTRZEŻEŃ --- */}
                    {user.warnings !== undefined && user.warnings > 0 && (
                        <Alert severity="warning" variant="filled" sx={{ mb: 4, borderRadius: 2 }}>
                            <AlertTitle>Uwaga!</AlertTitle>
                            Masz aktywne ostrzeżenia na koncie: <strong>{user.warnings}</strong>.
                            Prosimy o przestrzeganie regulaminu platformy, aby uniknąć blokady konta.
                        </Alert>
                    )}
                    {/* ----------------------- */}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* 1. GÓRA: Profil i Dane (Układ 1/3 + 2/3 na desktopie) */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                            gap: 3
                        }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <ProfileCard user={user} />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <AccountDetailsCard user={user} />
                            </Box>
                        </Box>

                        {/* 2. ŚRODEK: Wydarzenia */}
                        <UpcomingEventsSection />

                        {/* 3. ŚRODEK: Zaproszenia do grup */}
                        <GroupInvitationsSection />

                        {/* 4. DÓŁ: Znajomi */}
                        <FriendsSection user={user} />

                    </Box>
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