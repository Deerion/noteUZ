// src/pages/notes/shared.tsx
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {
    Box, Typography, Grid, Chip, CircularProgress, Alert, Paper, Button, Container, Fade, Divider
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockClockIcon from '@mui/icons-material/LockClock';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';

import {NotesLayout} from '@/components/NotesPage/NotesLayout';
import {NoteCard} from '@/components/NotesPage/NoteCard';
import {apiFetch} from '@/lib/api';
import {Note} from '@/types/Note';

interface SharedNote extends Note {
    permission?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    token?: string;
}

export default function SharedNotesPage() {
    const {t} = useTranslation('common');
    const router = useRouter();
    const {token} = router.query;

    const [notes, setNotes] = useState<SharedNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        if (!router.isReady) return;

        // Jeśli w URL jest token (wejście z maila), możemy automatycznie otworzyć ten widok
        // Nie akceptujemy automatycznie, żeby użytkownik widział co robi.
        fetchSharedNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

    const handleAcceptShare = async (noteId: string, tokenStr: string) => {
        setProcessingId(noteId);
        try {
            await apiFetch(`/api/notes/share/${tokenStr}/accept`, {method: 'POST'});
            setActionResult({type: 'success', msg: t('share_accepted_success') || 'Notatka została zaakceptowana!'});
            // Odśwież listę, aby przenieść notatkę do zaakceptowanych
            await fetchSharedNotes();
        } catch (e: unknown) {
            console.error(e);
            setActionResult({type: 'error', msg: t('error_general') || 'Wystąpił błąd.'});
        } finally {
            setProcessingId(null);
        }
    };

    const fetchSharedNotes = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<SharedNote[]>('/api/notes/shared');
            setNotes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Błąd pobierania", e);
        } finally {
            setLoading(false);
        }
    };

    // Dzielimy notatki na dwie grupy
    const pendingNotes = notes.filter(n => n.status === 'PENDING');
    const acceptedNotes = notes.filter(n => n.status === 'ACCEPTED');

    return (
        <>
            <Head>
                <title>{t('shared_notes') || "Udostępnione"} — NoteUZ</title>
            </Head>

            <NotesLayout title={t('shared_notes') || "Udostępnione dla mnie"}>
                <Container maxWidth="xl" disableGutters>

                    {actionResult && (
                        <Fade in>
                            <Alert
                                severity={actionResult.type}
                                sx={{mb: 4, borderRadius: 2}}
                                onClose={() => setActionResult(null)}
                            >
                                {actionResult.msg}
                            </Alert>
                        </Fade>
                    )}

                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 10}}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/* --- SEKCJA 1: ZAPROSZENIA (PENDING) --- */}
                            {pendingNotes.length > 0 && (
                                <Box sx={{mb: 6}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3, color: 'warning.main'}}>
                                        <MarkEmailUnreadIcon sx={{mr: 1.5, fontSize: 28}} />
                                        <Typography variant="h5" fontWeight={700}>
                                            {t('invitations') || "Oczekujące zaproszenia"} ({pendingNotes.length})
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        {pendingNotes.map((note) => (
                                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                <Box sx={{position: 'relative', height: '100%'}}>
                                                    {/* Rozmyta karta */}
                                                    <Box sx={{
                                                        filter: 'blur(3px) grayscale(60%)',
                                                        opacity: 0.8,
                                                        pointerEvents: 'none',
                                                        height: '100%'
                                                    }}>
                                                        <NoteCard note={note} />
                                                    </Box>

                                                    {/* Panel akceptacji */}
                                                    <Paper elevation={4} sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        m: 1,
                                                        borderRadius: 3,
                                                        bgcolor: 'rgba(255,255,255,0.85)',
                                                        backdropFilter: 'blur(4px)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        textAlign: 'center',
                                                        p: 2,
                                                        border: '2px dashed',
                                                        borderColor: 'primary.main'
                                                    }}>
                                                        <LockClockIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                                            {t('new_share') || "Nowe udostępnienie"}
                                                        </Typography>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={processingId === note.id ? <CircularProgress size={20} color="inherit"/> : <CheckCircleOutlineIcon />}
                                                            onClick={() => handleAcceptShare(note.id, note.token!)}
                                                            disabled={!!processingId}
                                                            sx={{ borderRadius: 10, px: 4, mt: 1 }}
                                                        >
                                                            {t('accept') || "Akceptuj"}
                                                        </Button>
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Divider sx={{my: 5}} />
                                </Box>
                            )}

                            {/* --- SEKCJA 2: ZAAKCEPTOWANE (ACCEPTED) --- */}
                            <Box>
                                <Typography variant="h5" fontWeight={700} sx={{mb: 3, display: 'flex', alignItems: 'center'}}>
                                    <ShareIcon sx={{mr: 1.5, color: 'text.secondary'}} />
                                    {t('my_shared_notes') || "Moje udostępnione notatki"}
                                </Typography>

                                {acceptedNotes.length === 0 ? (
                                    <Box sx={{textAlign: 'center', py: 8, opacity: 0.5}}>
                                        <Typography variant="body1">{t('no_shared_notes') || "Brak udostępnionych notatek."}</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={3}>
                                        {acceptedNotes.map((note) => (
                                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                                <Box sx={{position: 'relative', height: '100%'}}>
                                                    <NoteCard note={note} />
                                                    <Chip
                                                        label={note.permission === 'WRITE' ? (t('perm_write') || 'Edycja') : (t('perm_read') || 'Wgląd')}
                                                        size="small"
                                                        color={note.permission === 'WRITE' ? 'success' : 'default'}
                                                        variant="filled"
                                                        sx={{
                                                            position: 'absolute', top: 12, right: 12, zIndex: 2,
                                                            fontWeight: 'bold', fontSize: '0.7rem',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </>
                    )}
                </Container>
            </NotesLayout>
        </>
    );
}

export async function getServerSideProps({locale}: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}