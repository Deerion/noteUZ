// src/pages/notes/[id].tsx
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useState, FormEvent, useRef, useEffect} from 'react';
import {
    Box, TextField, Button as MuiButton, Paper, Grid, Alert, Divider,
    Typography, useTheme, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText,
    FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText,
    ListItemSecondaryAction, IconButton, Chip, Avatar, Tooltip, InputAdornment, Collapse
} from '@mui/material';
// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import LockIcon from '@mui/icons-material/Lock';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {NotesLayout} from '@/components/NotesPage/NotesLayout';
import {MarkdownEditor} from '@/components/MarkdownEditor';
import {Note} from '@/types/Note';
import {apiFetch} from '@/lib/api';

interface ExtendedNote extends Note {
    permission?: 'OWNER' | 'WRITE' | 'READ';
    userId?: string;
}

interface NoteShareInfo {
    id: string;
    email: string;
    status: string;
    permission: 'READ' | 'WRITE';
    token?: string;
}

interface ShareResponse {
    message: string;
    shareUrl?: string; // Backend zwraca teraz URL
}

interface Props { note: ExtendedNote; }

export const getServerSideProps: GetServerSideProps<Props> = async ({params, req, locale}) => {
    const noteId = params?.id;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const cookie = req.headers.cookie;
    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);

    if (!noteId) return {notFound: true};

    try {
        const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json', ...(cookie && {'Cookie': cookie})},
        });
        if (res.status === 404 || res.status === 403) return {notFound: true};
        if (!res.ok) throw new Error('Error');
        const note = (await res.json()) as ExtendedNote;
        return {props: {note, ...translations}};
    } catch (e) {
        return {notFound: true};
    }
};

export default function SingleNotePage({note: initialNote}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {t} = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    const isGroupNote = Boolean(initialNote.groupId);
    const permission = initialNote.permission || 'OWNER';
    const canEdit = permission === 'OWNER' || permission === 'WRITE';
    const isOwner = permission === 'OWNER';

    const [title, setTitle] = useState(initialNote.title || '');
    const [content, setContent] = useState(initialNote.content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Dialog Udostępniania
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePermission, setSharePermission] = useState('READ');
    const [shareLoading, setShareLoading] = useState(false);
    const [shares, setShares] = useState<NoteShareInfo[]>([]);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null); // Nowy stan dla linku
    const [shareError, setShareError] = useState<string | null>(null); // Błędy w modalu

    // Własny mail (do sprawdzenia w frontendzie, opcjonalnie)
    const [myEmail, setMyEmail] = useState<string>('');

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Pobierz mój email, żeby zablokować wpisywanie go w polu udostępniania
        apiFetch<{ email: string }>('/api/auth/me').then(data => setMyEmail(data.email)).catch(() => {});
    }, []);

    const handleBack = () => router.push(isGroupNote ? `/groups/${initialNote.groupId}` : '/notes');

    // Pobierz listę osób (tylko właściciel)
    useEffect(() => {
        if (shareDialogOpen && isOwner) {
            setGeneratedLink(null);
            setShareError(null);
            setShareEmail('');
            apiFetch<NoteShareInfo[]>(`/api/notes/${initialNote.id}/shares`)
                .then(data => setShares(data || []))
                .catch(console.error);
        }
    }, [shareDialogOpen, isOwner, initialNote.id]);

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        if (!canEdit) return;
        setLoading(true);
        try {
            await apiFetch(`/api/notes/${initialNote.id}`, {
                method: 'PUT',
                body: JSON.stringify({title, content}),
            });
            setIsEditing(false);
            router.reload();
        } catch (err) { setError(t('error_save_failed')); }
        finally { setLoading(false); }
    }

    async function handleDelete() {
        const msg = isOwner
            ? t('confirm_delete') || "Czy na pewno usunąć notatkę bezpowrotnie?"
            : "Czy na pewno usunąć notatkę z listy udostępnionych?";

        if (!confirm(msg)) return;
        setLoading(true);
        try {
            await apiFetch(`/api/notes/${initialNote.id}`, {method: 'DELETE'});
            router.push('/notes');
        } catch (err) { setError(t('error_delete_failed')); setLoading(false); }
    }

    async function handleShare() {
        setShareError(null);
        setGeneratedLink(null);

        if (!shareEmail.includes('@')) { setShareError(t('invalid_email')); return; }
        if (shareEmail.trim().toLowerCase() === myEmail.trim().toLowerCase()) {
            setShareError(t('share_self_error') || "Nie możesz udostępnić samemu sobie.");
            return;
        }

        setShareLoading(true);
        try {
            const res = await apiFetch<ShareResponse>(`/api/notes/${initialNote.id}/share`, {
                method: 'POST',
                body: JSON.stringify({email: shareEmail, permission: sharePermission})
            });

            // Sukces - pokaż link
            if (res.shareUrl) {
                setGeneratedLink(res.shareUrl);
            }

            setShareEmail(''); // Wyczyść pole
            // Odśwież listę
            const updatedShares = await apiFetch<NoteShareInfo[]>(`/api/notes/${initialNote.id}/shares`);
            setShares(updatedShares || []);
        } catch (error: unknown) {
            // Fix: Specify error type as unknown and cast or check
            let errMsg = t('error_sharing');
            if (error instanceof Error) {
                errMsg = error.message;
            }
            setShareError(errMsg);
        }
        finally { setShareLoading(false); }
    }

    async function handleRevokeAccess(shareId: string) {
        if(!confirm("Odebrać dostęp?")) return;
        try {
            await fetch(`/api/notes/share-update?shareId=${shareId}`, { method: 'DELETE' });
            const updated = shares.filter(s => s.id !== shareId);
            setShares(updated);
        } catch (e) { alert("Błąd"); }
    }

    async function handleChangeAccess(shareId: string, newPerm: string) {
        try {
            await fetch(`/api/notes/share-update`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({shareId, permission: newPerm})
            });
            // Aktualizuj lokalnie
            setShares(shares.map(s => s.id === shareId ? {...s, permission: newPerm as any} : s));
        } catch (e) { alert("Błąd"); }
    }

    async function handleExportPdf() {
        if (!printRef.current) return;
        setExporting(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDFModule = await import('jspdf');
            const JsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
            const element = printRef.current;

            const originalStyle = element.style.cssText;
            element.style.backgroundColor = '#ffffff';
            element.style.color = '#000000';
            element.style.padding = '20px';

            const canvas = await html2canvas(element, { scale: 3, useCORS: true });
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new JsPDF({orientation: 'portrait', unit: 'mm', format: 'a4'});
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * (pdfWidth - 30)) / imgProps.width;

            pdf.setFontSize(20);
            pdf.text(title.replace(/[^\x00-\x7F]/g, ""), 15, 20);
            pdf.addImage(imgData, 'PNG', 15, 30, pdfWidth - 30, pdfHeight);
            pdf.save(`NoteUZ.pdf`);
        } catch (e) { alert(t('error_export_failed')); }
        finally { setExporting(false); }
    }

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert(t('share_link_copied') || "Link skopiowany!");
        }
    }

    return (
        <>
            <Head><title>{title} — NoteUZ</title></Head>
            <NotesLayout
                title={isEditing ? t('edit_note_header') : t('view_note_header')}
                actionButton={<MuiButton startIcon={<ArrowBackIcon/>} onClick={handleBack}>{t('btn_back')}</MuiButton>}
            >
                <Paper sx={{p: {xs: 3, md: 5}, borderRadius: 4, mb: 3}}>
                    {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                    {successMsg && <Alert severity="success" sx={{mb: 2}}>{successMsg}</Alert>}

                    {!canEdit && (
                        <Alert severity="info" icon={<LockIcon />} sx={{mb: 3}}>
                            {t('read_only_mode') || "Tylko podgląd."}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSave} sx={{display: 'grid', gap: 3}}>
                        <TextField
                            label={t('label_title')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={!isEditing || !canEdit}
                            fullWidth
                            variant={isEditing ? "outlined" : "standard"}
                            slotProps={{input: {sx: {fontSize: '1.5rem', fontWeight: 700}}}}
                        />

                        {!isEditing ? (
                            <Box ref={printRef} sx={{minHeight: 200, p: 2}}>
                                {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> :
                                    <Typography color="text.disabled" fontStyle="italic">{t('note_no_content')}</Typography>}
                            </Box>
                        ) : (
                            <MarkdownEditor value={content} onChange={setContent} minRows={15}/>
                        )}

                        <Divider sx={{my: 2}}/>

                        <Grid container spacing={2} justifyContent="flex-end">
                            {!isEditing ? (
                                <>
                                    {!isGroupNote && isOwner && (
                                        <Grid>
                                            <MuiButton onClick={() => setShareDialogOpen(true)} variant="outlined" startIcon={<ShareIcon/>}>
                                                {t('notes.share')}
                                            </MuiButton>
                                        </Grid>
                                    )}
                                    <Grid>
                                        <MuiButton onClick={handleExportPdf} variant="outlined" color="secondary" disabled={exporting} startIcon={exporting ? <CircularProgress size={20}/> : <PictureAsPdfIcon/>}>
                                            {t('btn_export_pdf')}
                                        </MuiButton>
                                    </Grid>
                                    {canEdit && (
                                        <Grid>
                                            <MuiButton onClick={() => setIsEditing(true)} variant="contained" startIcon={<EditIcon/>}>
                                                {t('btn_edit')}
                                            </MuiButton>
                                        </Grid>
                                    )}
                                    <Grid>
                                        <MuiButton onClick={handleDelete} color="error" variant="outlined" startIcon={<DeleteIcon/>}>
                                            {isOwner ? t('btn_delete') : "Usuń z listy"}
                                        </MuiButton>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid><MuiButton onClick={() => setIsEditing(false)} disabled={loading} startIcon={<CloseIcon/>} color="inherit">{t('btn_cancel')}</MuiButton></Grid>
                                    <Grid><MuiButton type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon/>}>{t('btn_save')}</MuiButton></Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Paper>

                {/* --- MODAL UDOSTĘPNIANIA --- */}
                <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        {t('notes.share_note')}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{mb: 2}}>
                            {t('share_desc')}
                        </DialogContentText>

                        {/* FORMULARZ */}
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1}}>
                            <TextField
                                fullWidth
                                label={t('notes.recipient_email')}
                                type="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="user@example.com"
                                variant="outlined"
                                size="small"
                                error={!!shareError}
                                helperText={shareError}
                            />
                            <FormControl size="small" sx={{minWidth: 110}}>
                                <InputLabel>{t('permission')}</InputLabel>
                                <Select
                                    value={sharePermission}
                                    label={t('permission')}
                                    onChange={(e) => setSharePermission(e.target.value)}
                                >
                                    <MenuItem value="READ">{t('perm_read')}</MenuItem>
                                    <MenuItem value="WRITE">{t('perm_write')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <MuiButton
                                onClick={handleShare}
                                variant="contained"
                                disabled={shareLoading || !shareEmail}
                                endIcon={shareLoading ? <CircularProgress size={16} /> : <MarkEmailReadIcon />}
                            >
                                {t('notes.share')}
                            </MuiButton>
                        </Box>

                        {/* LINK MANUALNY (JEŚLI WYGENEROWANY) */}
                        <Collapse in={!!generatedLink}>
                            <Alert severity="success" sx={{ mb: 3, alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    {t('email_sent_success')}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {t('share_manual_link_label') || "Jeśli e-mail nie dotrze, wyślij ten link:"}
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={generatedLink || ''}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={copyLink}>
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { bgcolor: 'background.paper', fontSize: '0.85rem' }
                                    }}
                                />
                            </Alert>
                        </Collapse>

                        <Divider sx={{my: 2}} />

                        {/* LISTA UDOSTĘPNIEŃ */}
                        <Typography variant="overline" color="text.secondary" fontWeight={700}>
                            Osoby z dostępem ({shares.length})
                        </Typography>

                        {shares.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
                                Nikt jeszcze nie ma dostępu.
                            </Typography>
                        ) : (
                            <List dense sx={{ mt: 1 }}>
                                {shares.map(s => {
                                    const initial = s.email.charAt(0).toUpperCase();
                                    return (
                                        <ListItem
                                            key={s.id}
                                            divider
                                            sx={{
                                                bgcolor: theme.palette.action.hover,
                                                borderRadius: 2,
                                                mb: 1
                                            }}
                                        >
                                            <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.secondary.main, fontSize: '0.9rem' }}>
                                                {initial}
                                            </Avatar>
                                            <ListItemText
                                                primary={<Typography fontWeight={500}>{s.email}</Typography>}
                                                secondary={
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip
                                                            label={s.status === 'ACCEPTED' ? t('status_accepted') : (s.status === 'REJECTED' ? t('status_rejected') : t('status_pending'))}
                                                            size="small"
                                                            color={s.status === 'ACCEPTED' ? 'success' : 'warning'}
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Select
                                                    value={s.permission}
                                                    size="small"
                                                    variant="standard"
                                                    disableUnderline
                                                    onChange={(e) => handleChangeAccess(s.id, e.target.value)}
                                                    sx={{ fontSize: '0.8rem', mr: 1, fontWeight: 600, color: 'primary.main' }}
                                                >
                                                    <MenuItem value="READ">{t('perm_read')}</MenuItem>
                                                    <MenuItem value="WRITE">{t('perm_write')}</MenuItem>
                                                </Select>
                                                <Tooltip title="Odbierz dostęp">
                                                    <IconButton edge="end" onClick={() => handleRevokeAccess(s.id)} size="small" color="error">
                                                        <PersonRemoveIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                })}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <MuiButton onClick={() => setShareDialogOpen(false)}>{t('common.cancel')}</MuiButton>
                    </DialogActions>
                </Dialog>
            </NotesLayout>
        </>
    );
}