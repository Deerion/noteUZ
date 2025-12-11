// src/pages/groups/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Typography, Grid, Card, CardContent, Button,
    Chip, Dialog, DialogTitle, DialogContent, TextField,
    DialogActions, CircularProgress, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/GroupWork';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { apiFetch } from '@/lib/api';
import { GroupDTO } from '@/types/Group';

export default function GroupsListPage() {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const [groups, setGroups] = useState<GroupDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal tworzenia
    const [openModal, setOpenModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchGroups = async () => {
        try {
            const data = await apiFetch<GroupDTO[]>('/api/groups');
            setGroups(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleCreate = async () => {
        if (!newName) return;
        setCreating(true);
        try {
            await apiFetch('/api/groups', {
                method: 'POST',
                body: JSON.stringify({ name: newName, description: newDesc })
            });
            setOpenModal(false);
            setNewName(''); setNewDesc('');
            fetchGroups();
        } catch (e) {
            alert(t('error_create_failed'));
        } finally {
            setCreating(false);
        }
    };

    // Podział grup
    const myGroups = groups.filter(g => g.myRole === 'OWNER');
    const joinedGroups = groups.filter(g => g.myRole !== 'OWNER');

    const GroupItem = ({ group }: { group: GroupDTO }) => (
        <Card
            elevation={0}
            onClick={() => router.push(`/groups/${group.groupId}`)}
            sx={{
                height: '100%',
                border: '1px solid', borderColor: 'divider', borderRadius: '16px',
                cursor: 'pointer', transition: 'all 0.2s',
                '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)' }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <GroupIcon color="primary" />
                    <Chip
                        label={group.myRole}
                        size="small"
                        color={group.myRole === 'OWNER' ? 'secondary' : 'default'}
                        variant="outlined"
                    />
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>{group.groupName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {group.description || t('no_description')}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head><title>Grupy — NoteUZ</title></Head>
            <NotesLayout
                title={t('groups_title') || "Grupy"}
                actionButton={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                        sx={{ borderRadius: '12px' }}
                    >
                        {t('create_group_btn') || "Nowa Grupa"}
                    </Button>
                }
            >
                {loading ? <CircularProgress /> : (
                    <Box>
                        {/* Moje Grupy */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 1 }}>
                            {t('groups_owned') || "Stworzone przeze mnie"}
                        </Typography>
                        {myGroups.length === 0 && <Typography color="text.secondary" fontStyle="italic">Brak grup.</Typography>}

                        {/* --- POPRAWKA TUTAJ: size={{...}} zamiast item xs={...} --- */}
                        <Grid container spacing={3} sx={{ mb: 5 }}>
                            {myGroups.map(g => (
                                <Grid key={g.groupId} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GroupItem group={g} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Dołączone */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                            {t('groups_joined') || "Grupy, do których należę"}
                        </Typography>
                        {joinedGroups.length === 0 && <Typography color="text.secondary" fontStyle="italic">Brak grup.</Typography>}

                        {/* --- POPRAWKA TUTAJ: size={{...}} zamiast item xs={...} --- */}
                        <Grid container spacing={3}>
                            {joinedGroups.map(g => (
                                <Grid key={g.groupId} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GroupItem group={g} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* MODAL TWORZENIA */}
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
                    <DialogTitle>{t('create_group_header') || "Utwórz nową grupę"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus margin="dense" label={t('group_name_label') || "Nazwa grupy"}
                            fullWidth variant="outlined"
                            value={newName} onChange={e => setNewName(e.target.value)}
                        />
                        <TextField
                            margin="dense" label={t('group_desc_label') || "Opis"}
                            fullWidth multiline rows={3} variant="outlined"
                            value={newDesc} onChange={e => setNewDesc(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenModal(false)}>{t('btn_cancel')}</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={creating || !newName}>
                            {creating ? '...' : t('btn_create') || "Utwórz"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </NotesLayout>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});