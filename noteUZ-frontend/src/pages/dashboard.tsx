import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
    Box, Container, Typography, Grid, CircularProgress, Alert
} from '@mui/material';

import { ProfileCard } from '@/components/Dashboard/ProfileCard';
import { AccountDetailsCard } from '@/components/Dashboard/AccountDetailsCard';
import { FriendsSection } from '@/components/Dashboard/FriendsSection';
import { GroupInvitationsSection } from '@/components/Dashboard/GroupInvitationsSection';
// Import nowej sekcji
import { UpcomingEventsSection } from '@/components/Dashboard/UpcomingEventsSection';
import { UserData } from '@/types/User';
import { Navbar } from '@/components/landing/Navbar';
import { apiFetch } from '@/lib/api'; // Używamy apiFetch dla spójności

export default function Dashboard() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Używamy apiFetch, żeby automatycznie obsługiwać tokeny/odświeżanie
        apiFetch<UserData>('/api/auth/me')
            .then(data => setUser(data))
            .catch(() => {
                // Jeśli błąd autoryzacji, apiFetch to obsłuży lub rzuci błąd
                router.push('/login');
            })
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

    // TO JEST KLUCZOWE - zapobiega błędowi "reading 'email' of undefined"
    if (!user) return null;

    return (
        <>
            <Head>
                <title>{t('dashboard_title', 'Panel główny')} — NoteUZ</title>
            </Head>

            <Box sx={{
                minHeight: '100vh',
                background: 'var(--page-gradient)',
                display: 'flex',
                flexDirection: 'column',
                pb: 8
            }}>
                {/* Twój oryginalny Navbar */}
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    busy={busy}
                    hideSearch={true}
                />

                <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
                    <Typography variant="h4" component="h1" fontWeight={800} sx={{ mb: 4, px: 1 }}>
                        {t('your_panel', 'Twój panel')}
                    </Typography>

                    <Grid container spacing={3}>
                        {/* LEWA KOLUMNA */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <ProfileCard user={user} />
                                <AccountDetailsCard user={user} />
                            </Box>
                        </Grid>

                        {/* PRAWA KOLUMNA */}
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                                {/* NOWA SEKKCJA WYDARZEŃ */}
                                <UpcomingEventsSection />

                                <GroupInvitationsSection />

                                {/* FriendsSection bezpiecznie otrzymuje usera, bo sprawdziliśmy go wyżej */}
                                <FriendsSection user={user} />
                            </Box>
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