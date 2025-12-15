import React, {useState, useEffect} from 'react';
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

// Importy MUI
import {Box, Typography, Grid, Divider, Chip} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

// Importy Komponentów
import {NotesLayout} from '@/components/NotesPage/NotesLayout';
import {NoteCard} from '@/components/NotesPage/NoteCard';
import {CreateNoteButton} from '@/components/NotesPage/CreateNoteButton';
import {apiFetch} from '@/lib/api';

// Import typu
import {Note} from '@/types/Note';

// Rozszerzamy typ Note o opcjonalne pole permission (dla udostępnionych)
// Oraz pole status, żeby móc odfiltrować niezaakceptowane zaproszenia
interface SharedNote extends Note {
    permission?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

type Props = {
    notes: Note[];
    status: number;
    error?: string;
};

// --- SSR: Pobiera MOJE notatki ---
export const getServerSideProps: GetServerSideProps<Props> = async ({req, locale}) => {
    const API = process.env.NEXT_PUBLIC_API_URL!;
    const cookie = req.headers.cookie;

    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);

    try {
        const res = await fetch(`${API}/api/notes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie && {'Cookie': cookie}),
            },
            cache: 'no-store',
        });

        if (res.status === 401) {
            return {
                redirect: {
                    destination: `/error?code=401`,
                    permanent: false,
                },
            };
        }

        if (!res.ok) {
            let errorMsg = `Błąd API ${res.status}`;
            try {
                const data = await res.json();
                errorMsg = data.message || errorMsg;
            } catch (e) { /* ignore */
            }

            return {
                redirect: {
                    destination: `/error?code=${res.status}&msg=${encodeURIComponent(errorMsg)}`,
                    permanent: false,
                },
            };
        }

        const data = await res.json();
        // ZABEZPIECZENIE: Upewniamy się, że to tablica
        const notes = Array.isArray(data) ? data : [];

        return {
            props: {
                notes: notes,
                status: res.status,
                ...translations,
            },
        };
    } catch (e: unknown) {
        return {
            redirect: {
                destination: `/error?code=503`,
                permanent: false,
            },
        };
    }
};

export default function NotesPage({
                                      notes = [], // ZABEZPIECZENIE: Domyślna wartość
                                  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {t} = useTranslation('common');

    // Stan dla udostępnionych notatek
    const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);

    // Pobieramy notatki udostępnione po załadowaniu strony
    useEffect(() => {
        const fetchShared = async () => {
            try {
                const data = await apiFetch<SharedNote[]>('/api/notes/shared');

                if (Array.isArray(data)) {
                    // --- ZMIANA: Filtracja ---
                    // Wyświetlamy tutaj TYLKO notatki, które zostały już zaakceptowane.
                    // Zaproszenia oczekujące (PENDING) są widoczne na osobnej podstronie (notes/shared.tsx).
                    const acceptedOnly = data.filter(note => note.status === 'ACCEPTED');
                    setSharedNotes(acceptedOnly);
                } else {
                    setSharedNotes([]);
                }
            } catch (e) {
                console.error("Błąd pobierania udostępnionych notatek", e);
            }
        };
        fetchShared();
    }, []);

    return (
        <>
            <Head>
                <title>{t('my_notes')} — NoteUZ</title>
            </Head>

            <NotesLayout
                title={t('my_notes')}
                actionButton={<CreateNoteButton/>}
            >
                {/* --- SEKCJA: MOJE NOTATKI --- */}
                {notes.length === 0 ? (
                    <Box sx={{textAlign: 'center', py: 8}}>
                        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                            {t('notes_empty_title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('notes_empty_desc')}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {notes.map((note) => (
                            // POPRAWKA GRID: Używamy 'size' zamiast 'item xs={...}'
                            <Grid key={note.id} size={{xs: 12, sm: 6, md: 4}}>
                                <NoteCard note={note}/>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* --- SEKCJA: UDOSTĘPNIONE DLA MNIE (NOWA) --- */}
                <Box sx={{mt: 6}}>
                    <Divider sx={{mb: 4}}>
                        <Chip icon={<ShareIcon/>} label="Udostępnione dla mnie"/>
                    </Divider>

                    {sharedNotes.length > 0 ? (
                        <Grid container spacing={3}>
                            {sharedNotes.map((note) => (
                                // POPRAWKA GRID: Używamy 'size' zamiast 'item xs={...}'
                                <Grid key={note.id} size={{xs: 12, sm: 6, md: 4}}>
                                    <Box sx={{position: 'relative'}}>
                                        <NoteCard note={note}/>
                                        {/* Opcjonalnie: Badge z uprawnieniami */}
                                        <Chip
                                            label={note.permission === 'WRITE' ? 'Edycja' : 'Wgląd'}
                                            size="small"
                                            color={note.permission === 'WRITE' ? 'secondary' : 'default'}
                                            sx={{position: 'absolute', top: 10, right: 10, zIndex: 1}}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography color="text.secondary" textAlign="center">
                            {/* Komunikat, gdy nie ma zaakceptowanych notatek */}
                            Brak udostępnionych notatek.
                        </Typography>
                    )}
                </Box>
            </NotesLayout>
        </>
    );
}