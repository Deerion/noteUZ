import React, { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Typography, Tabs, Tab, Paper, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, IconButton, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, Chip, Divider, Menu, MenuItem, Alert, Tooltip,
    Snackbar, DialogContentText, Grid, Select, FormControl, InputLabel,
    useTheme, alpha, Stack
} from '@mui/material';

// Ikony
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';   // <-- Nowa ikona
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // <-- Nowa ikona

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { NoteCard } from '@/components/NotesPage/NoteCard';
import { apiFetch } from '@/lib/api';
import { GroupDetails, GroupMember, GroupRole } from '@/types/Group';
import { Note } from '@/types/Note';

// --- PODIUM ITEM ---
const PodiumItem = ({ note, rank, members, onClick }: { note: Note, rank: 1 | 2 | 3, members: GroupMember[], onClick: () => void }) => {
    const theme = useTheme();
    const isWinner = rank === 1;

    const activeColor = theme.palette.primary.main;
    const passiveColor = theme.palette.text.secondary;

    const scale = isWinner ? 1.0 : 0.9;
    const yOffset = isWinner ? -15 : 0;

    const author = members.find(m => m.userId === note.userId);
    const authorName = author ? (author.displayName || author.email || "Nieznany") : "Nieznany";
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transform: `scale(${scale}) translateY(${yOffset}px)`,
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                position: 'relative',
                zIndex: isWinner ? 2 : 1,
                mx: { xs: 0, sm: 1 },
                '&:hover': { transform: `scale(${scale * 1.03}) translateY(${yOffset - 5}px)` }
            }}
        >
            <EmojiEventsIcon sx={{
                fontSize: isWinner ? 32 : 24,
                color: isWinner ? activeColor : passiveColor,
                mb: 1,
                opacity: isWinner ? 1 : 0.7
            }} />

            <Paper
                elevation={0}
                sx={{
                    width: 150,
                    height: 'auto',
                    minHeight: 160,
                    borderRadius: '24px',
                    bgcolor: isWinner ? alpha(activeColor, 0.04) : theme.palette.background.paper,
                    border: '1px solid',
                    borderColor: isWinner ? alpha(activeColor, 0.3) : theme.palette.divider,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    p: 2,
                    position: 'relative',
                }}
            >
                <Box sx={{
                    position: 'absolute', top: 12, left: 12,
                    typography: 'caption', fontWeight: 800,
                    color: isWinner ? activeColor : passiveColor,
                    opacity: 0.8
                }}>
                    #{rank}
                </Box>

                <Typography
                    variant="body1"
                    fontWeight={700}
                    align="center"
                    sx={{
                        width: '100%',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3,
                        mb: 1.5,
                        mt: 2,
                        color: theme.palette.text.primary
                    }}
                >
                    {note.title || "Bez tytułu"}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, maxWidth: '100%' }}>
                    <Avatar
                        src={`/api/proxy-avatar/${note.userId}`}
                        sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: theme.palette.divider }}
                    >
                        {authorInitial}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 90 }}>
                        {authorName}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{
                    color: isWinner ? activeColor : theme.palette.text.secondary,
                    bgcolor: isWinner ? alpha(activeColor, 0.1) : alpha(theme.palette.text.secondary, 0.1),
                    px: 1, py: 0.5, borderRadius: '8px'
                }}>
                    <FavoriteIcon sx={{ fontSize: 12 }} />
                    <Typography variant="caption" fontWeight={700}>
                        {note.voteCount}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

// --- LIDER WIEDZY ---
const TopContributorCard = ({ member, totalVotes }: { member: GroupMember, totalVotes: number }) => {
    const theme = useTheme();
    const displayName = member.displayName || member.email || "Użytkownik";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 4,
                borderRadius: '24px',
                border: '1px solid',
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                // Fix: usunięto alpha() z drugiego koloru gradientu, bo to zmienna CSS
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
                display: 'flex', alignItems: 'center', gap: 2
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <Avatar
                    src={`/api/proxy-avatar/${member.userId}`}
                    alt={displayName}
                    sx={{ width: 56, height: 56, bgcolor: theme.palette.secondary.main, fontSize: '1.5rem', fontWeight: 700 }}
                >
                    {initial}
                </Avatar>
                <Box sx={{
                    position: 'absolute', bottom: -4, right: -4,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: '50%', p: 0.5,
                    boxShadow: theme.shadows[1]
                }}>
                    <WorkspacePremiumIcon color="secondary" fontSize="small" />
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" fontWeight={700} color="secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Lider Wiedzy
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Autor najbardziej pomocnych notatek
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', px: 2 }}>
                <Typography variant="h4" fontWeight={800} color="secondary">
                    {totalVotes}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    GŁOSÓW
                </Typography>
            </Box>
        </Paper>
    );
};

export default function GroupDetailsPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();
    const { id } = router.query;

    const [details, setDetails] = useState<GroupDetails | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);

    // --- SORTOWANIE ---
    const [sortBy, setSortBy] = useState<'DATE' | 'VOTES' | 'ALPHABET'>('DATE');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Nowy stan

    // State management
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [creatingNote, setCreatingNote] = useState(false);
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

    const topContributor = useMemo(() => {
        if (!notes.length || !details) return null;
        const voteMap: Record<string, number> = {};
        notes.forEach(note => {
            const votes = note.voteCount || 0;
            if (votes > 0 && note.userId) {
                voteMap[note.userId] = (voteMap[note.userId] || 0) + votes;
            }
        });
        let maxVotes = 0;
        let topUserId = null;
        Object.entries(voteMap).forEach(([userId, total]) => {
            if (total > maxVotes) {
                maxVotes = total;
                topUserId = userId;
            }
        });
        if (!topUserId || maxVotes === 0) return null;
        const member = details.members.find(m => m.userId === topUserId);
        return member ? { member, totalVotes: maxVotes } : null;
    }, [notes, details]);

    const podiumNotes = useMemo(() => {
        return [...notes]
            .filter(n => (n.voteCount || 0) > 0)
            .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
            .slice(0, 3);
    }, [notes]);

    // --- LOGIKA SORTOWANIA Z KIERUNKIEM ---
    const listNotes = useMemo(() => {
        let list = [...notes];

        list.sort((a, b) => {
            let res = 0;
            if (sortBy === 'VOTES') {
                res = (a.voteCount || 0) - (b.voteCount || 0);
            } else if (sortBy === 'ALPHABET') {
                res = a.title.localeCompare(b.title);
            } else { // DATE
                const tA = new Date(a.created_at).getTime();
                const tB = new Date(b.created_at).getTime();
                res = tA - tB;
            }

            // Domyślny porządek logiczny:
            // Votes: rosnąco = mało głosów -> dużo głosów
            // Alphabet: rosnąco = A -> Z
            // Date: rosnąco = stare -> nowe

            // Jeśli użytkownik wybrał 'desc' (malejąco), odwracamy wynik
            return sortDirection === 'asc' ? res : -res;
        });

        return list;
    }, [notes, sortBy, sortDirection]);

    const handleToggleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const myMemberRec = details?.members.find(m => m.userId === myId);
    const myRole = myMemberRec?.role || 'MEMBER';
    const canManage = myRole === 'OWNER' || myRole === 'ADMIN';
    const roleLabels: Record<string, string> = { OWNER: t('role_OWNER'), ADMIN: t('role_ADMIN'), MEMBER: t('role_MEMBER') };

    const handleCreateNote = async () => {
        if (!noteTitle) return;
        setCreatingNote(true);
        try {
            await apiFetch(`/api/groups/${id}/notes`, { method: 'POST', body: JSON.stringify({ title: noteTitle, content: noteContent }) });
            setNoteOpen(false); setNoteTitle(''); setNoteContent('');
            showSnackbar("Notatka dodana pomyślnie!", 'success'); fetchData();
        } catch (e) { showSnackbar("Błąd tworzenia notatki", 'error'); } finally { setCreatingNote(false); }
    };
    const handleInvite = async () => {
        if (inviting || !inviteEmail) return;
        setInviting(true);
        try {
            await apiFetch(`/api/groups/${id}/members`, { method: 'POST', body: JSON.stringify({ email: inviteEmail }) });
            setInviteOpen(false); setInviteEmail(''); showSnackbar(t('invite_sent_success'), 'success');
        } catch (e: any) { showSnackbar(e.message || t('error_invite_failed'), 'error'); } finally { setInviting(false); }
    };
    const openConfirm = (title: string, desc: string, action: () => Promise<void>) => {
        setConfirmTitle(title); setConfirmDesc(desc); setConfirmAction(() => action); setConfirmOpen(true);
    };
    const handleRemoveMember = async (targetUserId: string) => {
        openConfirm(t('confirm_remove_member_title'), t('confirm_remove_member_desc'), async () => {
            try { await apiFetch(`/api/groups/${id}/members/${targetUserId}`, { method: 'DELETE' }); showSnackbar(t('success_member_removed'), 'success'); fetchData(); } catch (e) { showSnackbar(t('error_delete_failed'), 'error'); }
        });
    };
    const handleLeaveGroup = async () => {
        if (!myId) return;
        openConfirm(t('confirm_leave_group_title'), t('confirm_leave_group_desc'), async () => {
            try { await apiFetch(`/api/groups/${id}/members/${myId}`, { method: 'DELETE' }); showSnackbar(t('success_left_group'), 'success'); router.push('/groups'); } catch (e: any) { showSnackbar(e.message || t('error_leave_failed'), 'error'); }
        });
    };
    const handleDeleteNote = async (noteId: string) => {
        openConfirm(t('confirm_delete'), "Usunąć notatkę?", async () => {
            try { await apiFetch(`/api/notes/${noteId}`, { method: 'DELETE' }); showSnackbar("Notatka usunięta", 'success'); fetchData(); } catch (e) { showSnackbar(t('error_delete_failed'), 'error'); }
        });
    };
    const handleEditNote = (note: Note) => { router.push(`/notes/${note.id}`); };
    const handleChangeRole = async (role: GroupRole) => {
        if (!selectedMember) return;
        try { await apiFetch(`/api/groups/${id}/members/${selectedMember.userId}`, { method: 'PATCH', body: JSON.stringify({ role }) }); setAnchorEl(null); showSnackbar(t('success_role_changed'), 'success'); fetchData(); } catch (e) { showSnackbar(t('error_save_failed'), 'error'); }
    };

    if (loading || !details) return <NotesLayout title="..." >Loading...</NotesLayout>;

    return (
        <>
            <Head><title>{details.group.name} — NoteUZ</title></Head>
            <NotesLayout
                title={details.group.name}
                actionButton={<Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/groups')}>{t('btn_back')}</Button>}
            >
                {details.group.description && (
                    <Box sx={{ mb: 4 }}>
                        <Typography color="text.secondary">{details.group.description}</Typography>
                    </Box>
                )}

                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={t('tab_notes')} />
                    <Tab label={`${t('tab_members')} (${details.members.length})`} />
                </Tabs>

                {tab === 0 && (
                    <Box>
                        {topContributor && (
                            <TopContributorCard member={topContributor.member} totalVotes={topContributor.totalVotes} />
                        )}

                        {podiumNotes.length > 0 && (
                            <Box sx={{ mb: 6, mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="overline" color="text.secondary" letterSpacing={2} fontWeight={700} sx={{ mb: 4 }}>
                                    TOP NOTATKI
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: { xs: 1, sm: 2 }, minHeight: 180 }}>
                                    {podiumNotes[1] && <PodiumItem note={podiumNotes[1]} rank={2} members={details.members} onClick={() => handleEditNote(podiumNotes[1])} />}
                                    {podiumNotes[0] && <PodiumItem note={podiumNotes[0]} rank={1} members={details.members} onClick={() => handleEditNote(podiumNotes[0])} />}
                                    {podiumNotes[2] && <PodiumItem note={podiumNotes[2]} rank={3} members={details.members} onClick={() => handleEditNote(podiumNotes[2])} />}
                                </Box>
                            </Box>
                        )}

                        {/* PASEK SORTOWANIA */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SortIcon color="action" />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Sortuj według</InputLabel>
                                    <Select value={sortBy} label="Sortuj według" onChange={(e) => setSortBy(e.target.value as any)} sx={{ borderRadius: '12px' }}>
                                        <MenuItem value="DATE">Data dodania</MenuItem>
                                        <MenuItem value="VOTES">Liczba głosów</MenuItem>
                                        <MenuItem value="ALPHABET">Alfabetycznie</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* PRZYCISK ZMIANY KIERUNKU SORTOWANIA */}
                                <Tooltip title={sortDirection === 'asc' ? "Rosnąco" : "Malejąco"}>
                                    <IconButton
                                        onClick={handleToggleSortDirection}
                                        size="small"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: '8px',
                                            p: 1
                                        }}
                                    >
                                        {sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setNoteOpen(true)} sx={{ borderRadius: '12px', px: 3, py: 1, fontWeight: 700, textTransform: 'none' }}>
                                {t('create_group_note') || "Dodaj notatkę"}
                            </Button>
                        </Box>

                        {listNotes.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary', borderRadius: '16px', bgcolor: 'transparent', border: '1px dashed divider' }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>{t('notes_empty_title')}</Typography>
                                <Typography variant="body2">{t('notes_empty_desc')}</Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3} alignItems="stretch">
                                {listNotes.map((note) => (
                                    <Grid item xs={12} sm={6} md={4} key={note.id} sx={{ display: 'flex' }}>
                                        <Box sx={{ width: '100%' }}>
                                            <NoteCard note={note} onEdit={handleEditNote} onDelete={handleDeleteNote} showVotes={true} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {tab === 1 && (
                    <Box>
                        {canManage && (
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button startIcon={<PersonAddIcon />} variant="outlined" onClick={() => setInviteOpen(true)} sx={{ borderRadius: '100px' }}>
                                    {t('invite_member')}
                                </Button>
                            </Box>
                        )}
                        <List sx={{ display: 'grid', gap: 1 }}>
                            {details.members.map((member) => {
                                const isMe = member.userId === myId;
                                const isOwner = member.role === 'OWNER';
                                const displayName = member.displayName || member.email || 'Użytkownik';
                                const initial = displayName.charAt(0).toUpperCase();
                                const isTopContributor = topContributor?.member.userId === member.userId;

                                return (
                                    <ListItem key={member.id} sx={{ borderRadius: '16px', bgcolor: isTopContributor ? alpha(theme.palette.secondary.main, 0.05) : theme.palette.background.paper, border: '1px solid', borderColor: isTopContributor ? theme.palette.secondary.main : 'divider' }}
                                              secondaryAction={
                                                  isMe ? (!isOwner && <Tooltip title={t('leave_group')}><IconButton onClick={handleLeaveGroup} color="error"><ExitToAppIcon /></IconButton></Tooltip>)
                                                      : (canManage ? <IconButton onClick={(e) => { setSelectedMember(member); setAnchorEl(e.currentTarget); }}><MoreVertIcon /></IconButton> : null)
                                              }
                                    >
                                        <ListItemAvatar>
                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar src={`/api/proxy-avatar/${member.userId}`} alt={displayName} sx={{ bgcolor: isMe ? 'primary.main' : undefined }}>{initial}</Avatar>
                                                {isTopContributor && <Box sx={{ position: 'absolute', bottom: -2, right: -2, bgcolor: 'background.paper', borderRadius: '50%', p: 0.2 }}><StarIcon sx={{ fontSize: 14, color: 'secondary.main' }} /></Box>}
                                            </Box>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span style={{ fontWeight: isMe ? 700 : 500 }}>{isMe ? `${displayName} (${t('me')})` : displayName}</span>{isTopContributor && <Chip label="Lider" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}</Box>}
                                            secondary={`${t('join_date_label')}: ${new Date(member.joinedAt).toLocaleDateString()}`}
                                        />
                                        <Chip label={roleLabels[member.role] || member.role} size="small" color={member.role === 'OWNER' ? 'secondary' : member.role === 'ADMIN' ? 'primary' : 'default'} sx={{ mr: 2, borderRadius: '8px', fontWeight: 600 }} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                )}

                {/* MODALE */}
                <Dialog open={noteOpen} onClose={() => setNoteOpen(false)} fullWidth>
                    <DialogTitle>{t('create_new_note_header')}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" label={t('label_title')} fullWidth value={noteTitle} onChange={e => setNoteTitle(e.target.value)} />
                        <TextField margin="dense" label={t('label_content')} fullWidth multiline rows={4} value={noteContent} onChange={e => setNoteContent(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNoteOpen(false)}>{t('btn_cancel')}</Button>
                        <Button onClick={handleCreateNote} variant="contained" disabled={creatingNote || !noteTitle}>{creatingNote ? '...' : t('btn_create')}</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
                    <DialogTitle>{t('invite_title')}</DialogTitle>
                    <DialogContent><TextField autoFocus margin="dense" label={t('email_label')} type="email" fullWidth value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></DialogContent>
                    <DialogActions><Button onClick={() => setInviteOpen(false)}>{t('btn_cancel')}</Button><Button onClick={handleInvite} variant="contained" disabled={inviting}>{inviting ? '...' : t('btn_send')}</Button></DialogActions>
                </Dialog>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>{confirmTitle}</DialogTitle>
                    <DialogContent><DialogContentText>{confirmDesc}</DialogContentText></DialogContent>
                    <DialogActions><Button onClick={() => setConfirmOpen(false)}>{t('btn_cancel')}</Button><Button onClick={() => { if (confirmAction) confirmAction(); setConfirmOpen(false); }} color="error" variant="contained" autoFocus>{t('btn_confirm')}</Button></DialogActions>
                </Dialog>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={() => handleChangeRole('ADMIN')} disabled={selectedMember?.role === 'ADMIN'}>{t('menu_make_admin')}</MenuItem>
                    <MenuItem onClick={() => handleChangeRole('MEMBER')} disabled={selectedMember?.role === 'MEMBER'}>{t('menu_make_member')}</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { if (selectedMember) handleRemoveMember(selectedMember.userId); setAnchorEl(null); }} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }} /> {t('menu_remove_from_group')}</MenuItem>
                </Menu>
                <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.msg}</Alert></Snackbar>
            </NotesLayout>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});