import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, List, ListItem,
    ListItemText, Stack
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiFetch } from '@/lib/api';

interface GroupInvitation {
    invitationId: string;
    groupId: string;
    groupName: string;
    inviterName: string;
    sentAt: string;
}

export const GroupInvitationsSection = () => {
    const [invites, setInvites] = useState<GroupInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvites = async () => {
        try {
            const data = await apiFetch<GroupInvitation[]>('/api/groups/invitations');
            setInvites(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvites(); }, []);

    const handleResponse = async (invitationId: string, accept: boolean) => {
        try {
            await apiFetch(`/api/groups/invitations/${invitationId}`, {
                method: 'POST',
                body: JSON.stringify({ accept })
            });
            fetchInvites(); // Odśwież listę
        } catch (e) {
            alert('Wystąpił błąd podczas przetwarzania zaproszenia.');
        }
    };

    if (loading) return null;
    if (invites.length === 0) return null;

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GroupAddIcon color="secondary" />
                <Typography variant="h6" fontWeight={700}>Zaproszenia do Grup</Typography>
            </Box>

            <List dense>
                {invites.map(inv => (
                    <ListItem
                        key={inv.invitationId}
                        sx={{
                            border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 1.5,
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 1, p: 2
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography fontWeight={600}>
                                    {inv.groupName}
                                </Typography>
                            }
                            secondary={`Zaprasza: ${inv.inviterName} • ${new Date(inv.sentAt).toLocaleDateString()}`}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained" color="success" size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleResponse(inv.invitationId, true)}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Dołącz
                            </Button>
                            <Button
                                variant="outlined" color="error" size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleResponse(inv.invitationId, false)}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Odrzuć
                            </Button>
                        </Stack>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};