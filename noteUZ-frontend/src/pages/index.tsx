// src/pages/index.tsx
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Box, Container } from '@mui/material';

// Import komponentów
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { Footer } from '../components/landing/Footer';
import { UserData } from '@/types/User'; // <--- DODANY IMPORT

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Home() {
    const { t } = useTranslation('common');
    // Zmieniamy boolean na obiekt użytkownika
    const [user, setUser] = useState<UserData | null>(null);
    const [busy, setBusy] = useState(false);

    async function refreshSession() {
        try {
            const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUser(data); // Zapisujemy dane użytkownika
                return true;
            } else {
                setUser(null);
                return false;
            }
        } catch {
            setUser(null);
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
                setUser(null);
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — {t('welcome')}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <Box component="main" sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--page-gradient)',
                overflowX: 'hidden'
            }}>
                {/* Przekazujemy teraz obiekt 'user' zamiast 'isLoggedIn' */}
                <Navbar user={user} onLogout={onLogout} busy={busy} />

                <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 4, pb: 8 }}>
                    {/* HeroSection nadal potrzebuje boolean, więc rzutujemy !!user */}
                    <HeroSection isLoggedIn={!!user} />
                    <FeaturesSection />
                </Container>

                <Footer />
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