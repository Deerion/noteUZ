// src/pages/notes/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, FormEvent } from 'react';
import { Box, TextField, Button as MuiButton, Paper, Grid, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { Note } from '@/types/Note';

interface Props {
    note: Note;
}

// SERVER SIDE
export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req }) => {
    const noteId = params?.id;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const cookie = req.headers.cookie;

    if (!noteId) return { notFound: true };

    try {
        const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie && { 'Cookie': cookie }),
            },
        });

        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error('Błąd pobierania');

        const note = (await res.json()) as Note;
        return { props: { note } };
    } catch (e) {
        return { notFound: true };
    }
};

export default function SingleNotePage({ note: initialNote }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    const [title, setTitle] = useState(initialNote.title || '');
    const [content, setContent] = useState(initialNote.content || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // CLIENT SIDE
    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) throw new Error('Nie udało się zapisać zmian');

            setIsEditing(false);
            router.reload();
        } catch (err: unknown) { // POPRAWKA: 'unknown' zamiast 'any'
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Wystąpił nieznany błąd podczas zapisu.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Czy na pewno usunąć?')) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Błąd usuwania');
            router.push('/notes');
        } catch (err: unknown) { // POPRAWKA: 'unknown' zamiast 'any'
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Wystąpił nieznany błąd podczas usuwania.');
            }
            setLoading(false);
        }
    }

    return (
        <>
            <Head><title>{title} — NoteUZ</title></Head>
            <NotesLayout
                title={isEditing ? 'Edycja notatki' : 'Podgląd notatki'}
                actionButton={
                    <MuiButton startIcon={<ArrowBackIcon />} onClick={() => router.push('/notes')}>Wróć</MuiButton>
                }
            >
                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            label="Tytuł"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                        />
                        <TextField
                            label="Treść"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            disabled={!isEditing}
                            multiline rows={8} fullWidth
                        />

                        {/* POPRAWKA: Usunięto prop 'item' z Grid */}
                        <Grid container spacing={2} justifyContent="flex-end">
                            {!isEditing ? (
                                <>
                                    <Grid>
                                        <MuiButton onClick={() => setIsEditing(true)} variant="contained">
                                            Edytuj
                                        </MuiButton>
                                    </Grid>
                                    <Grid>
                                        <MuiButton onClick={handleDelete} color="error" variant="outlined" startIcon={<DeleteIcon />}>
                                            Usuń
                                        </MuiButton>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid>
                                        <MuiButton onClick={() => setIsEditing(false)} disabled={loading}>
                                            Anuluj
                                        </MuiButton>
                                    </Grid>
                                    <Grid>
                                        <MuiButton type="submit" variant="contained" disabled={loading}>
                                            Zapisz
                                        </MuiButton>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Paper>
            </NotesLayout>
        </>
    );
}