// src/pages/groups/[id].tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, IconButton, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, Chip, Divider, Menu, MenuItem, Alert, Tooltip,
    Snackbar, DialogContentText, Grid, CircularProgress
} from '@mui/material';
// Ikony
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NoteAddIcon from '@mui/icons-material/NoteAdd'; // <--- IKONA NOTATKI

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { NoteCard } from '@/components/NotesPage/NoteCard'; // <--- Używamy tego samego kafelka co w "Moje notatki"
import { apiFetch } from '@/lib/api';
import { GroupDetails, GroupMember, GroupRole } from '@/types/Group';
import { Note } from '@/types/Note'; // <--- IMPORT

export default function GroupDetailsPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { id } = router.query;

    const [details, setDetails] = useState<GroupDetails | null>(null);
    const [notes, setNotes] = useState<Note[]>([]); // <--- STAN NOTATEK
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);

    // Zarządzanie członkami
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviting, setInviting] = useState(false);

    // Zarządzanie notatkami (NOWE)
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [creatingNote, setCreatingNote] = useState(false);

    // Menu ról i dialogi
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmDesc, setConfirmDesc] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
    const [myId, setMyId] = useState<string | null>(null);

    const showSnackbar = (msg: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, msg, severity });
    };

    const fetchData = async () => {
        if (!id) return;
        try {
            // Równoległe pobieranie szczegółów i notatek
            const [groupData, notesData] = await Promise.all([
                apiFetch<GroupDetails>(`/api/groups/${id}`),
                apiFetch<Note[]>(`/api/groups/${id}/notes`)
            ]);
            setDetails(groupData);
            setNotes(notesData || []);
        } catch (e) {
            router.push('/groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    useEffect(() => {
        apiFetch<{ id: string }>('/api/auth/me').then(u => setMyId(u.id)).catch(() => {});
    }, []);

    const myMemberRec = details?.members.find(m => m.userId === myId);
    const myRole = myMemberRec?.role || 'MEMBER';
    const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

    // Rola Labels
    const roleLabels: Record<string, string> = {
        OWNER: t('role_OWNER'),
        ADMIN: t('role_ADMIN'),
        MEMBER: t('role_MEMBER'),
    };

    // --- AKCJE ---

    // 1. TWORZENIE NOTATKI (NOWE)
    const handleCreateNote = async () => {
        if (!noteTitle) return;
        setCreatingNote(true);
        try {
            await apiFetch(`/api/groups/${id}/notes`, {
                method: 'POST',
                body: JSON.stringify({ title: noteTitle, content: noteContent })
            });
            setNoteOpen(false);
            setNoteTitle('');
            setNoteContent('');
            showSnackbar("Notatka dodana pomyślnie!", 'success');
            fetchData(); // Odśwież listę
        } catch (e) {
            showSnackbar("Błąd tworzenia notatki", 'error');
        } finally {
            setCreatingNote(false);
        }
    };

    // 2. ZAPRASZANIE
    const handleInvite = async () => {
        if (inviting) return;
        if (!inviteEmail) return;
        setInviting(true);
        try {
            await apiFetch(`/api/groups/${id}/members`, {
                method: 'POST',
                body: JSON.stringify({ email: inviteEmail })
            });
            setInviteOpen(false);
            setInviteEmail('');
            showSnackbar(t('invite_sent_success'), 'success');
        } catch (e: unknown) {
            let message = t('error_invite_failed');
            if (e instanceof Error) message = e.message;
            showSnackbar(message, 'error');
        } finally {
            setInviting(false);
        }
    };

    // 3. DIALOG POTWIERDZENIA
    const openConfirm = (title: string, desc: string, action: () => Promise<void>) => {
        setConfirmTitle(title);
        setConfirmDesc(desc);
        setConfirmAction(() => action);
        setConfirmOpen(true);
    };

    const handleRemoveMember = async (targetUserId: string) => {
        openConfirm(t('confirm_remove_member_title'), t('confirm_remove_member_desc'), async () => {
            try {
                await apiFetch(`/api/groups/${id}/members/${targetUserId}`, { method: 'DELETE' });
                showSnackbar(t('success_member_removed'), 'success');
                fetchData();
            } catch (e) { showSnackbar(t('error_delete_failed'), 'error'); }
        });
    };

    const handleLeaveGroup = async () => {
        if (!myId) return;
        openConfirm(t('confirm_leave_group_title'), t('confirm_leave_group_desc'), async () => {
            try {
                await apiFetch(`/api/groups/${id}/members/${myId}`, { method: 'DELETE' });
                showSnackbar(t('success_left_group'), 'success');
                router.push('/groups');
            } catch (e: unknown) {
                let message = t('error_leave_failed');
                if (e instanceof Error) message = e.message;
                showSnackbar(message, 'error');
            }
        });
    };

    const handleChangeRole = async (role: GroupRole) => {
        if (!selectedMember) return;
        try {
            await apiFetch(`/api/groups/${id}/members/${selectedMember.userId}`, {
                method: 'PATCH',
                body: JSON.stringify({ role })
            });
            setAnchorEl(null);
            showSnackbar(t('success_role_changed'), 'success');
            fetchData();
        } catch (e) { showSnackbar(t('error_save_failed'), 'error'); }
    };

    if (loading || !details) return <NotesLayout title="..." >Loading...</NotesLayout>;

    return (
        <>
            <Head><title>{details.group.name} — NoteUZ</title></Head>
            <NotesLayout
                title={details.group.name}
                actionButton={<Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/groups')}>{t('btn_back')}</Button>}
            >
                <Typography color="text.secondary" sx={{ mb: 3 }}>{details.group.description}</Typography>

                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={t('tab_notes')} />
                    <Tab label={`${t('tab_members')} (${details.members.length})`} />
                </Tabs>

                {/* ZAKŁADKA NOTATKI */}
                {tab === 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<NoteAddIcon />}
                                onClick={() => setNoteOpen(true)}
                                sx={{ borderRadius: '10px' }}
                            >
                                {t('create_group_note')}
                            </Button>
                        </Box>

                        {notes.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography>{t('notes_empty_title')}</Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {notes.map(note => (
                                    // POPRAWKA: Użyj propsa 'size' zamiast 'item xs'
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={note.id}>
                                        <NoteCard note={note} />
                                    </Grid>
                                ))}
                            </Grid>                        )}
                    </Box>
                )}

                {/* ZAKŁADKA CZŁONKOWIE */}
                {tab === 1 && (
                    <Box>
                        {canManage && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button startIcon={<PersonAddIcon />} variant="outlined" onClick={() => setInviteOpen(true)}>
                                    {t('invite_member')}
                                </Button>
                            </Box>
                        )}
                        <Paper variant="outlined" sx={{ borderRadius: '12px' }}>
                            <List>
                                {details.members.map((member, i) => {
                                    const isMe = member.userId === myId;
                                    const isOwner = member.role === 'OWNER';
                                    const displayName = member.displayName || member.email || 'Użytkownik';
                                    const initial = displayName.charAt(0).toUpperCase();

                                    return (
                                        <React.Fragment key={member.id}>
                                            {i > 0 && <Divider />}
                                            <ListItem secondaryAction={
                                                isMe ? (!isOwner && <Tooltip title={t('leave_group')}><IconButton onClick={handleLeaveGroup} color="error"><ExitToAppIcon /></IconButton></Tooltip>)
                                                    : (canManage ? <IconButton onClick={(e) => { setSelectedMember(member); setAnchorEl(e.currentTarget); }}><MoreVertIcon /></IconButton> : null)
                                            }>
                                                <ListItemAvatar>
                                                    <Avatar src={`/api/proxy-avatar/${member.userId}`} alt={displayName} sx={{ bgcolor: isMe ? 'primary.main' : undefined }}>{initial}</Avatar>
                                                </ListItemAvatar>
                                                <ListItemText primary={<Box component="span" sx={{ fontWeight: isMe ? 700 : 400 }}>{isMe ? `${displayName} (${t('me')})` : displayName}</Box>} secondary={`${t('join_date_label')}: ${new Date(member.joinedAt).toLocaleDateString()}`} />
                                                <Chip label={roleLabels[member.role] || member.role} size="small" color={member.role === 'OWNER' ? 'secondary' : member.role === 'ADMIN' ? 'primary' : 'default'} sx={{ mr: 2 }} />
                                            </ListItem>
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Box>
                )}

                {/* MODAL: TWORZENIE NOTATKI */}
                <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} fullWidth>
                    <DialogTitle>{t('create_new_note_header')}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label={t('label_title')} fullWidth value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />
                        <TextField margin="dense" label={t('label_content')} fullWidth multiline rows={4} value={noteContent} onChange={e => setNoteContent(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNoteOpen(false)}>{t('btn_cancel')}</Button>
                        <Button onClick={handleCreateNote} variant="contained" disabled={creatingNote || !noteTitle}>
                            {creatingNote ? '...' : t('btn_create')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL: ZAPRASZANIE */}
                <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
                    <DialogTitle>{t('invite_title')}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label={t('email_label')} type="email" fullWidth value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setInviteOpen(false)}>{t('btn_cancel')}</Button>
                        <Button onClick={handleInvite} variant="contained" disabled={inviting}>{inviting ? '...' : t('btn_send')}</Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL: POTWIERDZENIE */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>{confirmTitle}</DialogTitle>
                    <DialogContent><DialogContentText>{confirmDesc}</DialogContentText></DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>{t('btn_cancel')}</Button>
                        <Button onClick={() => { if (confirmAction) confirmAction(); setConfirmOpen(false); }} color="error" variant="contained" autoFocus>{t('btn_confirm')}</Button>
                    </DialogActions>
                </Dialog>

                {/* MENU RÓL */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={() => handleChangeRole('ADMIN')} disabled={selectedMember?.role === 'ADMIN'}>{t('menu_make_admin')}</MenuItem>
                    <MenuItem onClick={() => handleChangeRole('MEMBER')} disabled={selectedMember?.role === 'MEMBER'}>{t('menu_make_member')}</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { if (selectedMember) handleRemoveMember(selectedMember.userId); setAnchorEl(null); }} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> {t('menu_remove_from_group')}</MenuItem>
                </Menu>

                {/* POWIADOMIENIA */}
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.msg}</Alert>
                </Snackbar>

            </NotesLayout>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});