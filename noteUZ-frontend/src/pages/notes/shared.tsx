import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import {
    Box, Typography, Grid, Chip, CircularProgress, Alert, Button, Container, Fade, Divider,
    Card, CardContent, CardActions, IconButton, Tooltip, useTheme, alpha
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';

import {NotesLayout} from '@/components/NotesPage/NotesLayout';
import {NoteCard} from '@/components/NotesPage/NoteCard';
import {apiFetch} from '@/lib/api';
import {Note} from '@/types/Note';

interface SharedNote extends Note {
    permission?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    token?: string;
}

export default function SharedNotesPage() {
    const {t} = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    const [notes, setNotes] = useState<SharedNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchSharedNotes = async () => {
        setLoading(true);
        try {
            const data = await apiFetch<SharedNote[]>('/api/notes/shared');
            setNotes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Błąd pobierania", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!router.isReady) return;
        fetchSharedNotes();
    }, [router.isReady]);

    const handleAcceptShare = async (noteId: string, tokenStr: string) => {
        setProcessingId(noteId);
        try {
            await apiFetch(`/api/notes/share/${tokenStr}/accept`, {method: 'POST'});
            setActionResult({
                type: 'success',
                msg: t('share_accepted_success') || 'Notatka została dodana do Twojej listy!'
            });
            await fetchSharedNotes();
        } catch (e: unknown) {
            console.error(e);
            setActionResult({
                type: 'error',
                msg: t('error_general') || 'Wystąpił błąd podczas akceptacji.'
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectShare = async (noteId: string) => {
        const confirmMsg = t('confirm_reject_share') || "Czy na pewno odrzucić to zaproszenie?";
        if (!confirm(confirmMsg)) return;

        setProcessingId(noteId);
        try {
            // Jako odbiorca usuwamy swój dostęp (status REJECTED/DELETE)
            await apiFetch(`/api/notes/${noteId}`, {method: 'DELETE'});
            setActionResult({
                type: 'success',
                msg: t('share_rejected_success') || 'Zaproszenie zostało odrzucone.'
            });
            await fetchSharedNotes();
        } catch (e) {
            setActionResult({
                type: 'error',
                msg: t('error_general') || 'Błąd podczas odrzucania zaproszenia.'
            });
        } finally {
            setProcessingId(null);
        }
    }

    const pendingNotes = notes.filter(n => n.status === 'PENDING');
    const acceptedNotes = notes.filter(n => n.status === 'ACCEPTED');

    return (
        <>
            <Head><title>{t('shared_notes')} — NoteUZ</title></Head>

            <NotesLayout title={t('shared_notes') || "Udostępnione dla mnie"}>
                <Container maxWidth="xl" disableGutters>

                    {actionResult && (
                        <Fade in>
                            <Alert
                                severity={actionResult.type}
                                sx={{mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}
                                onClose={() => setActionResult(null)}
                            >
                                {actionResult.msg}
                            </Alert>
                        </Fade>
                    )}

                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', py: 10}}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/* --- SEKCJA 1: ZAPROSZENIA (PENDING) --- */}
                            {pendingNotes.length > 0 && (
                                <Box sx={{mb: 8}}>
                                    <Typography variant="h6" fontWeight={700} sx={{mb: 4, display: 'flex', alignItems: 'center', color: theme.palette.text.primary}}>
                                        <MarkEmailUnreadIcon sx={{mr: 1.5, color: theme.palette.warning.main}} />
                                        {t('invitations')} ({pendingNotes.length})
                                    </Typography>

                                    <Grid container spacing={3} alignItems="stretch">
                                        {pendingNotes.map((note) => (
                                            // md: 3 daje 4 kafelki w rzędzie
                                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderRadius: '16px',
                                                        border: '1px dashed',
                                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                                        backgroundColor: theme.palette.mode === 'light'
                                                            ? 'rgba(249, 249, 249, 0.6)'
                                                            : 'rgba(26, 26, 26, 0.6)',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: theme.palette.primary.main,
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4, pb: 2 }}>
                                                        <Box sx={{
                                                            width: 56, height: 56, borderRadius: '50%',
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: theme.palette.primary.main,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            mx: 'auto', mb: 2
                                                        }}>
                                                            <MarkEmailUnreadIcon fontSize="medium" />
                                                        </Box>

                                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            {t('pending_share_subtitle') || "ZAPROSZENIE"}
                                                        </Typography>

                                                        <Typography variant="h6" fontWeight={700} sx={{ mt: 1, mb: 1, px: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {note.title || t('note_untitled')}
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary" sx={{ px: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {t('pending_share_desc') || "Użytkownik zaprasza Cię do edycji tej notatki."}
                                                        </Typography>
                                                    </CardContent>

                                                    <Divider sx={{ mx: 2, opacity: 0.5 }} />

                                                    <CardActions sx={{ justifyContent: 'center', p: 2, gap: 1 }}>
                                                        <Tooltip title={t('reject') || "Odrzuć"}>
                                                            <IconButton
                                                                onClick={() => handleRejectShare(note.id)}
                                                                color="error"
                                                                disabled={!!processingId}
                                                                size="small"
                                                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}
                                                            >
                                                                <DeleteOutlineIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            disableElevation
                                                            onClick={() => handleAcceptShare(note.id, note.token!)}
                                                            disabled={!!processingId}
                                                            startIcon={processingId === note.id ? <CircularProgress size={16} color="inherit"/> : <CheckIcon />}
                                                            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flex: 1 }}
                                                        >
                                                            {t('accept')}
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Divider sx={{my: 6}} />
                                </Box>
                            )}

                            {/* --- SEKCJA 2: ZAAKCEPTOWANE (ACCEPTED) --- */}
                            <Box>
                                <Typography variant="h6" fontWeight={700} sx={{mb: 4, display: 'flex', alignItems: 'center', color: 'text.secondary'}}>
                                    <ShareIcon sx={{mr: 1.5, fontSize: 22}} />
                                    {t('my_shared_notes')}
                                </Typography>

                                {acceptedNotes.length === 0 ? (
                                    <Box sx={{textAlign: 'center', py: 8, opacity: 0.6}}>
                                        <Typography variant="body1">{t('no_shared_notes')}</Typography>
                                    </Box>
                                ) : (
                                    <Grid container spacing={3} alignItems="stretch">
                                        {acceptedNotes.map((note) => (
                                            // md: 3 daje 4 kafelki w rzędzie
                                            <Grid key={note.id} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                                <Box sx={{position: 'relative', width: '100%', display: 'flex'}}>
                                                    <NoteCard note={note} />
                                                    <Chip
                                                        label={note.permission === 'WRITE' ? t('perm_write') : t('perm_read')}
                                                        size="small"
                                                        color={note.permission === 'WRITE' ? 'success' : 'default'}
                                                        variant="filled"
                                                        sx={{
                                                            position: 'absolute', top: 12, right: 12, zIndex: 2,
                                                            fontWeight: 'bold', fontSize: '0.7rem',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            backdropFilter: 'blur(4px)',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </>
                    )}
                </Container>
            </NotesLayout>
        </>
    );
}

export async function getServerSideProps({locale}: { locale: string }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}