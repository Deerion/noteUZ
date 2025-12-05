// src/pages/notes/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, FormEvent } from 'react';
import { Box, TextField, Button as MuiButton, Paper, Grid, Alert, Divider, Typography, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { MarkdownEditor } from '@/components/MarkdownEditor'; // <--- IMPORT
import { Note } from '@/types/Note';

interface Props { note: Note; }

// ... (getServerSideProps bez zmian) ...
export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req, locale }) => {
    /* ... Kod bez zmian z poprzedniego pliku ... */
    const noteId = params?.id;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const cookie = req.headers.cookie;
    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);
    if (!noteId) return { notFound: true };
    try {
        const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...(cookie && { 'Cookie': cookie }) },
        });
        if (res.status === 404) return { notFound: true };
        const note = (await res.json()) as Note;
        return { props: { note, ...translations } };
    } catch (e) { return { notFound: true }; }
};

export default function SingleNotePage({ note: initialNote }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    const [title, setTitle] = useState(initialNote.title || '');
    const [content, setContent] = useState(initialNote.content || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // ... (handleSave i handleDelete bez zmian) ...
    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (!res.ok) throw new Error(t('error_save_failed'));
            setIsEditing(false);
            router.reload();
        } catch (err: any) { setError(err.message || t('error_unknown')); } finally { setLoading(false); }
    }

    async function handleDelete() {
        if (!confirm(t('confirm_delete'))) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t('error_delete_failed'));
            router.push('/notes');
        } catch (err: any) { setError(err.message || t('error_unknown')); setLoading(false); }
    }

    // Style dla podglądu (View Mode) - można też wyciągnąć do osobnego pliku stylów, ale tu jest ok
    const markdownStyles = {
        '& h1, & h2, & h3': { color: 'text.primary', fontWeight: 800, mt: 3, mb: 1.5 },
        '& h1': { fontSize: '2rem', borderBottom: '1px solid', borderColor: 'divider', pb: 1 },
        '& p': { color: 'text.secondary', lineHeight: 1.7, mb: 2 },
        '& ul, & ol': { pl: 3, mb: 2, color: 'text.secondary' },
        '& a': { color: 'primary.main', textDecoration: 'none', fontWeight: 500 },
        '& blockquote': {
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            pl: 2.5, py: 0.5, my: 3,
            bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
            fontStyle: 'italic', color: 'text.primary'
        },
        '& code': {
            bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
            p: '2px 6px', borderRadius: '6px', fontFamily: 'monospace', color: theme.palette.secondary.main
        }
    };

    return (
        <>
            <Head><title>{title} — NoteUZ</title></Head>
            <NotesLayout
                title={isEditing ? t('edit_note_header') : t('view_note_header')}
                actionButton={<MuiButton startIcon={<ArrowBackIcon />} onClick={() => router.push('/notes')}>{t('btn_back')}</MuiButton>}
            >
                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 3 }}>

                        <TextField
                            value={title} onChange={e => setTitle(e.target.value)}
                            disabled={!isEditing} fullWidth
                            variant={isEditing ? "outlined" : "standard"}
                            slotProps={{ input: { sx: { fontSize: '1.5rem', fontWeight: 700, color: 'text.primary', '&.Mui-disabled': { WebkitTextFillColor: 'inherit' } } } }}
                        />

                        {/* WARUNKOWE WYŚWIETLANIE: EDITOR vs VIEWER */}
                        {!isEditing ? (
                            <Box sx={{ minHeight: 200, ...markdownStyles }}>
                                {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <Typography color="text.disabled" fontStyle="italic">{t('note_no_content')}</Typography>}
                            </Box>
                        ) : (
                            /* TUTAJ UŻYWAMY KOMPONENTU */
                            <MarkdownEditor
                                value={content}
                                onChange={setContent}
                                minRows={15}
                            />
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} justifyContent="flex-end">
                            {!isEditing ? (
                                <>
                                    <Grid><MuiButton onClick={() => setIsEditing(true)} variant="contained" startIcon={<EditIcon />} sx={{ borderRadius: '10px' }}>{t('btn_edit')}</MuiButton></Grid>
                                    <Grid><MuiButton onClick={handleDelete} color="error" variant="outlined" startIcon={<DeleteIcon />} sx={{ borderRadius: '10px' }}>{t('btn_delete')}</MuiButton></Grid>
                                </>
                            ) : (
                                <>
                                    <Grid><MuiButton onClick={() => { setIsEditing(false); setTitle(initialNote.title || ''); setContent(initialNote.content || ''); }} disabled={loading} startIcon={<CloseIcon />} color="inherit">{t('btn_cancel')}</MuiButton></Grid>
                                    <Grid><MuiButton type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon />} sx={{ borderRadius: '10px' }}>{t('btn_save')}</MuiButton></Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Paper>
            </NotesLayout>
        </>
    );
}