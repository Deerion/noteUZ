// src/pages/notes.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';

// Importy MUI
import { Box, Typography, Grid } from '@mui/material';

// Importy Komponentów
import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { NoteCard } from '@/components/NotesPage/NoteCard';
import { CreateNoteButton } from '@/components/NotesPage/CreateNoteButton';

// NOWY IMPORT: Używamy interfejsu z dedykowanego pliku
import { Note } from '@/types/Note';

// Nowy Interfejs Propsów
type Props = {
    notes: Note[];
    status: number;
    error?: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
    const API = process.env.NEXT_PUBLIC_API_URL!;

    // 1. Zabezpieczenie: Zalogowany użytkownik musi mieć cookie
    const cookie = req.headers.cookie;

    try {
        const res = await fetch(`${API}/api/notes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Przekazujemy cookie z przeglądarki do API, aby API mogło autoryzować
                ...(cookie && { 'Cookie': cookie }),
            },
            cache: 'no-store',
        });

        // 2. Obsługa błędu 401 (Brak autoryzacji)
        if (res.status === 401) {
            return {
                redirect: {
                    destination: `/error?code=401&msg=${encodeURIComponent('Aby zobaczyć notatki, musisz być zalogowany.')}`,
                    permanent: false,
                },
            };
        }

        // 3. Obsługa pozostałych błędów API
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

        // 4. Sukces: Pobranie notatek
        // Oczekujemy, że API zwróci listę pełnych obiektów Note
        const notes = (await res.json()) as Note[];

        return {
            props: {
                notes: notes,
                status: res.status,
            },
        };
    } catch (e: any) {
        // Fetch nie doszedł (ECONNREFUSED, ENOTFOUND, timeout)
        return {
            redirect: {
                destination: `/error?code=503&msg=${encodeURIComponent('Backend niedostępny lub błąd sieciowy.')}`,
                permanent: false,
            },
        };
    }
};

export default function NotesPage({
                                      notes,
                                  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
            <Head>
                <title>Moje Notatki — NoteUZ</title>
            </Head>

            <NotesLayout
                title="Moje Notatki"
                actionButton={<CreateNoteButton />}
            >
                {notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                            Jeszcze nie masz żadnych notatek!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Kliknij "Utwórz Notatkę", aby zacząć.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {notes.map((note) => (
                            // Zmiana składni na Grid v2: size={{...}}
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