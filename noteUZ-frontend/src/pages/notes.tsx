import React, { useState, useEffect } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Typography, Grid, Divider, Chip, Container } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { NoteCard } from '@/components/NotesPage/NoteCard';
import { CreateNoteButton } from '@/components/NotesPage/CreateNoteButton';
import { apiFetch } from '@/lib/api';
import { Note } from '@/types/Note';

interface SharedNote extends Note {
    permission?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

type Props = {
    notes: Note[];
    status: number;
    error?: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, locale }) => {
    const API = process.env.NEXT_PUBLIC_API_URL!;
    const cookie = req.headers.cookie;
    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);

    try {
        const res = await fetch(`${API}/api/notes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie && { 'Cookie': cookie }),
            },
        });

        if (res.status === 401) return { redirect: { destination: `/error?code=401`, permanent: false } };

        const data = await res.json();
        return { props: { notes: Array.isArray(data) ? data : [], status: res.status, ...translations } };
    } catch (e) {
        return { redirect: { destination: `/error?code=503`, permanent: false } };
    }
};

export default function NotesPage({ notes = [] }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common');
    const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);

    useEffect(() => {
        apiFetch<SharedNote[]>('/api/notes/shared')
            .then(data => {
                if (Array.isArray(data)) setSharedNotes(data.filter(n => n.status === 'ACCEPTED'));
            })
            .catch(console.error);
    }, []);

    return (
        <>
            <Head><title>{t('my_notes')} — NoteUZ</title></Head>

            <NotesLayout title={t('my_notes')} actionButton={<CreateNoteButton />}>
                {/* Kontener ogranicza szerokość na dużych ekranach, co poprawia czytelność i wyrównuje karty */}
                <Container maxWidth="xl" disableGutters>

                    {/* MOJE NOTATKI */}
                    {notes.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                            <Typography variant="h6">{t('notes_empty_title')}</Typography>
                            <Typography>{t('notes_empty_desc')}</Typography>
                        </Box>
                    ) : (
                        // Używamy alignItems="stretch", aby karty w rzędzie miały tę samą wysokość
                        <Grid container spacing={3} alignItems="stretch">
                            {notes.map((note) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={note.id} sx={{ display: 'flex' }}>
                                    {/* Wrapper z display: flex wymusza na NoteCard wypełnienie całej wysokości Grida */}
                                    <Box sx={{ width: '100%', display: 'flex' }}>
                                        <NoteCard note={note} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* UDOSTĘPNIONE */}
                    {sharedNotes.length > 0 && (
                        <Box sx={{ mt: 8 }}>
                            <Divider sx={{ mb: 4 }}><Chip icon={<ShareIcon />} label={t('shared_notes')} /></Divider>
                            <Grid container spacing={3} alignItems="stretch">
                                {sharedNotes.map((note) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={note.id} sx={{ display: 'flex' }}>
                                        {/* Box pozycjonowany relatywnie dla Chipa, zachowujący strukturę flex dla karty */}
                                        <Box sx={{ width: '100%', position: 'relative', display: 'flex' }}>
                                            <NoteCard note={note} />
                                            <Chip
                                                label={note.permission === 'WRITE' ? 'Edycja' : 'Wgląd'}
                                                size="small"
                                                color={note.permission === 'WRITE' ? 'secondary' : 'default'}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    zIndex: 1,
                                                    backdropFilter: 'blur(4px)',
                                                    // Ustawiamy lekką przezroczystość, aby Chip nie zasłaniał całkowicie tła karty
                                                    bgcolor: note.permission === 'WRITE' ? 'rgba(156, 39, 176, 0.8)' : 'rgba(0, 0, 0, 0.08)'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Container>
            </NotesLayout>
        </>
    );
}