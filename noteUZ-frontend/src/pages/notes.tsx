import React, { useState, useEffect } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Typography, Grid, Divider, Chip } from '@mui/material';
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

// --- SSR: Pobiera MOJE notatki z zachowaniem starej obsługi błędów ---
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

        if (res.status === 401) {
            return { redirect: { destination: `/error?code=401`, permanent: false } };
        }

        if (!res.ok) {
            let errorMsg = `Błąd API ${res.status}`;
            try {
                const data = await res.json();
                errorMsg = data.message || errorMsg;
            } catch (e) { /* ignoruj */ }

            return {
                redirect: {
                    destination: `/error?code=${res.status}&msg=${encodeURIComponent(errorMsg)}`,
                    permanent: false,
                },
            };
        }

        const data = await res.json();
        const notes = Array.isArray(data) ? data : [];

        return {
            props: {
                notes,
                status: res.status,
                ...translations
            }
        };
    } catch (e: unknown) {
        return { redirect: { destination: `/error?code=503`, permanent: false } };
    }
};

export default function NotesPage({ notes = [] }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common');
    const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);

    // Pobieramy notatki udostępnione (zachowano logikę filtrowania ACCEPTED)
    useEffect(() => {
        apiFetch<SharedNote[]>('/api/notes/shared')
            .then(data => {
                if (Array.isArray(data)) {
                    setSharedNotes(data.filter(n => n.status === 'ACCEPTED' || !n.status));
                }
            })
            .catch(console.error);
    }, []);

    return (
        <>
            <Head><title>{t('my_notes')} — NoteUZ</title></Head>

            <NotesLayout title={t('my_notes')} actionButton={<CreateNoteButton />}>

                {/* --- SEKCJA: MOJE NOTATKI --- */}
                {notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, opacity: 0.6 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>{t('notes_empty_title')}</Typography>
                        <Typography variant="body1">{t('notes_empty_desc')}</Typography>
                    </Box>
                ) : (
                    // alignItems="stretch" zapewnia, że wszystkie kolumny w rzędzie mają tę samą wysokość
                    <Grid container spacing={3} alignItems="stretch">
                        {notes.map((note) => (
                            // md: 3 daje 4 karty w rzędzie na komputerach
                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                <Box sx={{ width: '100%', display: 'flex' }}>
                                    <NoteCard note={note} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* --- SEKCJA: UDOSTĘPNIONE DLA MNIE --- */}
                {sharedNotes.length > 0 && (
                    <Box sx={{ mt: 10 }}>
                        <Divider sx={{ mb: 5 }}>
                            <Chip
                                icon={<ShareIcon />}
                                label={t('shared_notes', 'Udostępnione dla mnie')}
                                sx={{ px: 2, fontWeight: 700, borderRadius: '12px' }}
                            />
                        </Divider>

                        <Grid container spacing={3} alignItems="stretch">
                            {sharedNotes.map((note) => (
                                // md: 3 daje 4 karty w rzędzie
                                <Grid key={note.id} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                    <Box sx={{ width: '100%', position: 'relative', display: 'flex' }}>
                                        <NoteCard note={note} />
                                        <Chip
                                            label={note.permission === 'WRITE' ? t('perm_write') : t('perm_read')}
                                            size="small"
                                            color={note.permission === 'WRITE' ? 'secondary' : 'default'}
                                            sx={{
                                                position: 'absolute', top: 12, right: 12, zIndex: 2,
                                                fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                backdropFilter: 'blur(4px)', pointerEvents: 'none'
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </NotesLayout>
        </>
    );
}