// src/pages/notes.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next'; // <--- ZMIANA
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'; // <--- ZMIANA (Ważne dla SSR!)

// Importy MUI
import { Box, Typography, Grid } from '@mui/material';

// Importy Komponentów
import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { NoteCard } from '@/components/NotesPage/NoteCard';
import { CreateNoteButton } from '@/components/NotesPage/CreateNoteButton';

// Import typu
import { Note } from '@/types/Note';

type Props = {
    notes: Note[];
    status: number;
    error?: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, locale }) => {
    const API = process.env.NEXT_PUBLIC_API_URL!;
    const cookie = req.headers.cookie;

    // Pobierz tłumaczenia serwerowe (konieczne dla next-i18next na stronach SSR)
    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);

    try {
        const res = await fetch(`${API}/api/notes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie && { 'Cookie': cookie }),
            },
            cache: 'no-store',
        });

        if (res.status === 401) {
            return {
                redirect: {
                    destination: `/error?code=401`, // Wiadomość obsłużymy na stronie błędu
                    permanent: false,
                },
            };
        }

        if (!res.ok) {
            let errorMsg = `Błąd API ${res.status}`;
            try {
                const data = await res.json();
                errorMsg = data.message || errorMsg;
            } catch (e) { /* ignore */ }

            return {
                redirect: {
                    destination: `/error?code=${res.status}&msg=${encodeURIComponent(errorMsg)}`,
                    permanent: false,
                },
            };
        }

        const notes = (await res.json()) as Note[];

        return {
            props: {
                notes: notes,
                status: res.status,
                ...translations, // <--- Przekazujemy tłumaczenia
            },
        };
    } catch (e: any) {
        return {
            redirect: {
                destination: `/error?code=503`,
                permanent: false,
            },
        };
    }
};

export default function NotesPage({
                                      notes,
                                  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common'); // <--- ZMIANA

    return (
        <>
            <Head>
                <title>{t('my_notes')} — NoteUZ</title> {/* <--- ZMIANA */}
            </Head>

            <NotesLayout
                title={t('my_notes')} // <--- ZMIANA
                actionButton={<CreateNoteButton />}
            >
                {notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                            {t('notes_empty_title')} {/* <--- ZMIANA */}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('notes_empty_desc')} {/* <--- ZMIANA */}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {notes.map((note) => (
                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <NoteCard note={note} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </NotesLayout>
        </>
    );
}