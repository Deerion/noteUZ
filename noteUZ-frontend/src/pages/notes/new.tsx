// src/pages/notes/new.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import { Box, Typography, TextField, Button as MuiButton, CircularProgress, Paper, useTheme } from '@mui/material';
import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { apiFetch } from '@/lib/api';
import { Note } from '@/types/Note';

// Interfejs dla danych zwracanych po pomyślnym utworzeniu notatki
interface CreateNoteResponse extends Note {}

export default function NewNotePage() {
    const router = useRouter();
    const theme = useTheme();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!title.trim() && !content.trim()) {
            setError('Notatka musi mieć tytuł lub treść.');
            setLoading(false);
            return;
        }

        try {
            // Wysyłamy dane do back-endu (POST /api/notes)
            await apiFetch<CreateNoteResponse>('/api/notes', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            // Sukces! Przekierowanie do strony z notatkami
            router.push('/notes');

        } catch (err: any) {
            console.error('Błąd tworzenia notatki:', err);
            setError(err.message || 'Nie udało się utworzyć notatki. Spróbuj ponownie.');
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Nowa Notatka — NoteUZ</title>
            </Head>

            <NotesLayout
                title="Utwórz Nową Notatkę"
                actionButton={
                    <MuiButton
                        variant="outlined"
                        color="primary"
                        onClick={() => router.push('/notes')}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        Anuluj
                    </MuiButton>
                }
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 2 }}>

                        <TextField
                            label="Tytuł"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            size="medium"
                            fullWidth
                            sx={{ '.MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <TextField
                            label="Treść Notatki"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            multiline
                            rows={10}
                            fullWidth
                            sx={{ '.MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        {error && (
                            <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 1 }}>
                                {error}
                            </Typography>
                        )}

                        <MuiButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || (!title.trim() && !content.trim())}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                fontWeight: 700,
                                borderRadius: '12px'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Zapisz Notatkę'}
                        </MuiButton>
                    </Box>
                </Paper>
            </NotesLayout>
        </>
    );
}