import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Divider, Alert,
    IconButton, List, ListItem, ListItemText, ListItemAvatar,
    Avatar, Stack, TextField, alpha, useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'next-i18next'; // <--- DODANO
import { UserData, Friendship } from '@/types/User';

interface FriendsSectionProps {
    user: UserData;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ user }) => {
    const { t } = useTranslation('common'); // <--- DODANO
    const theme = useTheme();
    const [friends, setFriends] = useState<Friendship[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                const data = await res.json();
                setFriends(data);
            }
        } catch (e) {
            console.error('Błąd pobierania znajomych', e);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleInvite = async () => {
        if (!inviteEmail.includes('@')) {
            setMsg({ type: 'error', text: t('invalid_email_format') });
            return;
        }
        setActionLoading(true);
        setMsg(null);
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });
            if (res.ok) {
                setMsg({ type: 'success', text: t('invite_sent_success') });
                setInviteEmail('');
                fetchFriends();
            } else {
                const data = await res.json();
                setMsg({ type: 'error', text: data.message || t('error_sending') });
            }
        } catch {
            setMsg({ type: 'error', text: t('connection_error') });
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await fetch(`/api/friends/${id}`, { method: 'PUT' });
            fetchFriends();
        } catch (e) { console.error(e); }
    };

    const handleRemove = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await fetch(`/api/friends/${id}`, { method: 'DELETE' });
            fetchFriends();
        } catch (e) { console.error(e); }
    };

    const acceptedFriends = friends.filter(f => f.status === 'ACCEPTED');
    const incomingInvites = friends.filter(f => f.status === 'PENDING' && f.addresseeEmail === user.email);
    const outgoingInvites = friends.filter(f => f.status === 'PENDING' && f.requesterEmail === user.email);

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>{t('friends_section_title')}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>{t('your_friends')}</Typography>
                    </Box>

                    {acceptedFriends.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                            {t('no_friends_alert')}
                        </Alert>
                    ) : (
                        <List>
                            {acceptedFriends.map(f => {
                                const friendEmail = f.requesterEmail === user.email ? f.addresseeEmail : f.requesterEmail;
                                return (
                                    <ListItem key={f.id} secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => handleRemove(f.id)} title={t('delete_confirm')}>
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    }>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{friendEmail.charAt(0).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={friendEmail} secondary={t('friend_role')} />
                                    </ListItem>
                                )
                            })}
                        </List>
                    )}
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonAddIcon color="secondary" />
                            <Typography variant="h6" fontWeight={700}>{t('send_invite_title')}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth size="small" placeholder={t('friend_email_placeholder')}
                                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                sx={{ '.MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                            <Button variant="contained" disabled={actionLoading} onClick={handleInvite} sx={{ borderRadius: '10px', px: 3 }}>
                                {t('send_btn')}
                            </Button>
                        </Box>
                        {msg && <Alert severity={msg.type} sx={{ mt: 2, borderRadius: '10px' }}>{msg.text}</Alert>}
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('received_invites')} ({incomingInvites.length})</Typography>
                        {incomingInvites.length === 0 && <Typography variant="body2" color="text.secondary">{t('no_invites')}</Typography>}
                        <List dense>
                            {incomingInvites.map(f => (
                                <ListItem key={f.id} sx={{ px: 0 }}>
                                    <ListItemText primary={f.requesterEmail} secondary={t('invite_msg_incoming')} />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton color="success" onClick={() => handleAccept(f.id)}><CheckCircleIcon /></IconButton>
                                        <IconButton color="error" onClick={() => handleRemove(f.id)}><CancelIcon /></IconButton>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    {outgoingInvites.length > 0 && (
                        <Paper sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: theme.palette.mode === 'light'
                                ? 'rgba(255, 255, 255, 0.5)'
                                : 'rgba(26, 26, 26, 0.5)'
                        }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('sent_invites')}</Typography>
                            <List dense>
                                {outgoingInvites.map(f => (
                                    <ListItem key={f.id} sx={{ px: 0 }}>
                                        <ListItemText primary={f.addresseeEmail} secondary={t('waiting_approval')} />
                                        <IconButton size="small" onClick={() => handleRemove(f.id)}><CancelIcon fontSize="small" /></IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
};