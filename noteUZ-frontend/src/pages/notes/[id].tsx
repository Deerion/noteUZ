import type {GetServerSideProps, InferGetServerSidePropsType} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useState, FormEvent, useRef, useEffect} from 'react';
import {
    Box, TextField, Button as MuiButton, Paper, Grid, Alert, Divider,
    Typography, useTheme, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText,
    FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText,
    ListItemSecondaryAction, IconButton, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import LockIcon from '@mui/icons-material/Lock';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {NotesLayout} from '@/components/NotesPage/NotesLayout';
import {MarkdownEditor} from '@/components/MarkdownEditor';
import {Note} from '@/types/Note';
import {UserData} from '@/types/User';
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

    const printRef = useRef<HTMLDivElement>(null);

    const handleBack = () => router.push(isGroupNote ? `/groups/${initialNote.groupId}` : '/notes');

    // Pobierz listę osób (tylko właściciel)
    useEffect(() => {
        if (shareDialogOpen && isOwner) {
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
        if (!shareEmail.includes('@')) { alert(t('invalid_email')); return; }
        setShareLoading(true);
        try {
            await apiFetch(`/api/notes/${initialNote.id}/share`, {
                method: 'POST',
                body: JSON.stringify({email: shareEmail, permission: sharePermission})
            });
            setSuccessMsg(t('share_success'));
            setShareEmail('');
            // Odśwież listę
            const updatedShares = await apiFetch<NoteShareInfo[]>(`/api/notes/${initialNote.id}/shares`);
            setShares(updatedShares || []);
        } catch (error) { setError(t('error_sharing')); }
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
                                        <Grid item>
                                            <MuiButton onClick={() => setShareDialogOpen(true)} variant="outlined" startIcon={<ShareIcon/>}>
                                                {t('notes.share')}
                                            </MuiButton>
                                        </Grid>
                                    )}
                                    <Grid item>
                                        <MuiButton onClick={handleExportPdf} variant="outlined" color="secondary" disabled={exporting} startIcon={exporting ? <CircularProgress size={20}/> : <PictureAsPdfIcon/>}>
                                            {t('btn_export_pdf')}
                                        </MuiButton>
                                    </Grid>
                                    {canEdit && (
                                        <Grid item>
                                            <MuiButton onClick={() => setIsEditing(true)} variant="contained" startIcon={<EditIcon/>}>
                                                {t('btn_edit')}
                                            </MuiButton>
                                        </Grid>
                                    )}
                                    <Grid item>
                                        <MuiButton onClick={handleDelete} color="error" variant="outlined" startIcon={<DeleteIcon/>}>
                                            {isOwner ? t('btn_delete') : "Usuń z listy"}
                                        </MuiButton>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item><MuiButton onClick={() => setIsEditing(false)} disabled={loading} startIcon={<CloseIcon/>} color="inherit">{t('btn_cancel')}</MuiButton></Grid>
                                    <Grid item><MuiButton type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon/>}>{t('btn_save')}</MuiButton></Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Paper>

                <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{t('notes.share_note')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{mb: 2}}>{t('share_desc')}</DialogContentText>
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-end', mb: 4}}>
                            <TextField
                                fullWidth
                                label={t('notes.recipient_email')}
                                type="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="user@example.com"
                                variant="outlined"
                                size="small"
                            />
                            <FormControl size="small" sx={{minWidth: 120}}>
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
                            <MuiButton onClick={handleShare} variant="contained" disabled={shareLoading} sx={{height: 40}}>
                                {shareLoading ? "..." : t('notes.share')}
                            </MuiButton>
                        </Box>

                        {shares.length > 0 && (
                            <>
                                <Divider sx={{mb: 2}}><Typography variant="caption">OSOBY Z DOSTĘPEM</Typography></Divider>
                                <List dense>
                                    {shares.map(s => (
                                        <ListItem key={s.id} divider>
                                            <ListItemText
                                                primary={s.email}
                                                secondary={s.status === 'PENDING' ? 'Oczekuje...' : null}
                                            />
                                            <ListItemSecondaryAction sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Select
                                                    value={s.permission}
                                                    size="small"
                                                    variant="standard"
                                                    disableUnderline
                                                    onChange={(e) => handleChangeAccess(s.id, e.target.value)}
                                                    sx={{fontSize: '0.8rem', mr: 1}}
                                                >
                                                    <MenuItem value="READ">Wgląd</MenuItem>
                                                    <MenuItem value="WRITE">Edycja</MenuItem>
                                                </Select>
                                                <IconButton edge="end" onClick={() => handleRevokeAccess(s.id)} size="small" color="error">
                                                    <PersonRemoveIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </>
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