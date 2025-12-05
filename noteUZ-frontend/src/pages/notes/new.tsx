// src/pages/notes/new.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react';
import { Box, Typography, TextField, Button as MuiButton, CircularProgress, Paper, useTheme } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { MarkdownEditor } from '@/components/MarkdownEditor'; // <--- IMPORTUJEMY
import { apiFetch } from '@/lib/api';
import { Note } from '@/types/Note';

interface CreateNoteResponse extends Note {}

export default function NewNotePage() {
    const { t } = useTranslation('common');
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
            setError(t('error_required_fields'));
            setLoading(false);
            return;
        }

        try {
            await apiFetch<CreateNoteResponse>('/api/notes', {
                method: 'POST',
                body: JSON.stringify({ title: title.trim(), content: content.trim() }),
            });
            router.push('/notes');
        } catch (err: any) {
            setError(err.message || t('error_create_failed'));
            setLoading(false);
        }
    }

    return (
        <>
            <Head><title>{t('new_note_page_title')} — NoteUZ</title></Head>

            <NotesLayout
                title={t('create_new_note_header')}
                actionButton={
                    <MuiButton
                        variant="outlined" color="primary" onClick={() => router.push('/notes')}
                        disabled={loading} sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                        {t('btn_cancel')}
                    </MuiButton>
                }
            >
                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                    <Box component="form" onSubmit={onSubmit} sx={{ display: 'grid', gap: 3 }}>

                        <TextField
                            label={t('label_title')}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth sx={{ '.MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        {/* TUTAJ UŻYWAMY NOWEGO KOMPONENTU */}
                        <MarkdownEditor
                            value={content}
                            onChange={setContent}
                            placeholder={t('markdown_placeholder') || "Treść notatki..."}
                        />

                        {error && <Typography color="error" variant="body2">{error}</Typography>}

                        <MuiButton
                            type="submit" variant="contained" color="primary"
                            disabled={loading || (!title.trim() && !content.trim())}
                            sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px' }}
                        >
                            {loading ? <CircularProgress size={24} /> : t('btn_save_note')}
                        </MuiButton>
                    </Box>
                </Paper>
            </NotesLayout>
        </>
    );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});