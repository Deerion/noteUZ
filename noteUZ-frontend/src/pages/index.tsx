// src/pages/index.tsx
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Container } from '@mui/material';

// Import komponentów
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { Footer } from '../components/landing/Footer';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [busy, setBusy] = useState(false);

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

    return (
        <>
            <Head>
                <title>NoteUZ — Twoje Notatki</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <Box component="main" sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--page-gradient)',
                overflowX: 'hidden'
            }}>
                <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} busy={busy} />

                <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 4, pb: 8 }}>
                    <HeroSection isLoggedIn={isLoggedIn} />
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