// src/pages/notes/new.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import { Box, Typography, TextField, Button as MuiButton, CircularProgress, Paper, useTheme } from '@mui/material';
import { useTranslation } from 'next-i18next'; // <--- ZMIANA
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { apiFetch } from '@/lib/api';
import { Note } from '@/types/Note';

interface CreateNoteResponse extends Note {}

export default function NewNotePage() {
    const { t } = useTranslation('common'); // <--- ZMIANA
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
            setError(t('error_required_fields')); // <--- ZMIANA
            setLoading(false);
            return;
        }

        try {
            await apiFetch<CreateNoteResponse>('/api/notes', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                }),
            });

            router.push('/notes');

        } catch (err: any) {
            console.error('Błąd tworzenia notatki:', err);
            setError(err.message || t('error_create_failed')); // <--- ZMIANA
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>{t('new_note_page_title')} — NoteUZ</title> {/* <--- ZMIANA */}
            </Head>

            <NotesLayout
                title={t('create_new_note_header')} // <--- ZMIANA
                actionButton={
                    <MuiButton
                        variant="outlined"
                        color="primary"
                        onClick={() => router.push('/notes')}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                    >
                        {t('btn_cancel')} {/* <--- ZMIANA */}
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
                            label={t('label_title')} // <--- ZMIANA
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            size="medium"
                            fullWidth
                            sx={{ '.MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <TextField
                            label={t('label_content')} // <--- ZMIANA
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : t('btn_save_note')} {/* <--- ZMIANA */}
                        </MuiButton>
                    </Box>
                </Paper>
            </NotesLayout>
        </>
    );
}

// Dodajemy getStaticProps dla tłumaczeń
export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
        },
    };
};