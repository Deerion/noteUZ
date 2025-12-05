// src/components/Dashboard/FriendsSection.tsx
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
import { UserData, Friendship } from '@/types/User';

interface FriendsSectionProps {
    user: UserData;
}

export const FriendsSection: React.FC<FriendsSectionProps> = ({ user }) => {
    const theme = useTheme();
    const [friends, setFriends] = useState<Friendship[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Pobieranie listy znajomych
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

    // Wysyłanie zaproszenia
    const handleInvite = async () => {
        if (!inviteEmail.includes('@')) {
            setMsg({ type: 'error', text: 'Podaj poprawny adres e-mail.' });
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
                setMsg({ type: 'success', text: 'Zaproszenie wysłane!' });
                setInviteEmail('');
                fetchFriends();
            } else {
                const data = await res.json();
                setMsg({ type: 'error', text: data.message || 'Błąd wysyłania.' });
            }
        } catch {
            setMsg({ type: 'error', text: 'Błąd połączenia.' });
        } finally {
            setActionLoading(false);
        }
    };

    // Akceptacja zaproszenia
    const handleAccept = async (id: string) => {
        try {
            await fetch(`/api/friends/${id}`, { method: 'PUT' });
            fetchFriends();
        } catch (e) { console.error(e); }
    };

    // Usuwanie / Odrzucanie
    const handleRemove = async (id: string) => {
        if (!confirm('Na pewno usunąć?')) return;
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
            {/* Nagłówek Sekcji */}
            {/* POPRAWKA: Grid v2 - używamy 'size' */}
            <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Znajomi i Zaproszenia</Typography>
            </Grid>

            {/* KOLUMNA 1: Lista znajomych */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>Twoi Znajomi</Typography>
                    </Box>

                    {acceptedFriends.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                            Nie masz jeszcze znajomych. Wyślij komuś zaproszenie!
                        </Alert>
                    ) : (
                        <List>
                            {acceptedFriends.map(f => {
                                const friendEmail = f.requesterEmail === user.email ? f.addresseeEmail : f.requesterEmail;
                                return (
                                    <ListItem key={f.id} secondaryAction={
                                        <IconButton edge="end" color="error" onClick={() => handleRemove(f.id)} title="Usuń znajomego">
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    }>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{friendEmail.charAt(0).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={friendEmail} secondary="Znajomy" />
                                    </ListItem>
                                )
                            })}
                        </List>
                    )}
                </Paper>
            </Grid>

            {/* KOLUMNA 2: Zapraszanie i Oczekujące */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                    {/* WYSYŁANIE */}
                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonAddIcon color="secondary" />
                            <Typography variant="h6" fontWeight={700}>Wyślij zaproszenie</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth size="small" placeholder="Email znajomego"
                                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                sx={{ '.MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                            <Button variant="contained" disabled={actionLoading} onClick={handleInvite} sx={{ borderRadius: '10px', px: 3 }}>
                                Wyślij
                            </Button>
                        </Box>
                        {msg && <Alert severity={msg.type} sx={{ mt: 2, borderRadius: '10px' }}>{msg.text}</Alert>}
                    </Paper>

                    {/* OCZEKUJĄCE PRZYCHODZĄCE */}
                    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Otrzymane zaproszenia ({incomingInvites.length})</Typography>
                        {incomingInvites.length === 0 && <Typography variant="body2" color="text.secondary">Brak nowych zaproszeń.</Typography>}
                        <List dense>
                            {incomingInvites.map(f => (
                                <ListItem key={f.id} sx={{ px: 0 }}>
                                    <ListItemText primary={f.requesterEmail} secondary="Chce dodać Cię do znajomych" />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton color="success" onClick={() => handleAccept(f.id)}><CheckCircleIcon /></IconButton>
                                        <IconButton color="error" onClick={() => handleRemove(f.id)}><CancelIcon /></IconButton>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>

                    {/* WYSŁANE OCZEKUJĄCE */}
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
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Wysłane (oczekujące)</Typography>
                            <List dense>
                                {outgoingInvites.map(f => (
                                    <ListItem key={f.id} sx={{ px: 0 }}>
                                        <ListItemText primary={f.addresseeEmail} secondary="Czeka na akceptację..." />
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