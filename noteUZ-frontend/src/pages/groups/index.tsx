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
    DialogActions, CircularProgress, useTheme, alpha
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

    // Komponent pojedynczego elementu grupy z poprawionym layoutem
    const GroupItem = ({ group }: { group: GroupDTO }) => (
        <Card
            elevation={0}
            onClick={() => router.push(`/groups/${group.groupId}`)}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main'
                    }}>
                        <GroupIcon />
                    </Box>
                    <Chip
                        label={group.myRole}
                        size="small"
                        color={group.myRole === 'OWNER' ? 'secondary' : 'default'}
                        variant="filled"
                        sx={{ fontWeight: 700, borderRadius: '8px', fontSize: '0.7rem' }}
                    />
                </Box>

                <Typography variant="h6" sx={{
                    fontWeight: 800,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3
                }}>
                    {group.groupName}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.6,
                    flexGrow: 1
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
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 700 }}
                    >
                        {t('create_group_btn') || "Nowa Grupa"}
                    </Button>
                }
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        {/* Moje Grupy */}
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 3, mt: 1, px: 1 }}>
                            {t('groups_owned') || "Stworzone przeze mnie"}
                        </Typography>

                        {myGroups.length === 0 ? (
                            <Typography color="text.secondary" sx={{ mb: 6, px: 1, opacity: 0.7 }}>Brak grup stworzonych przez Ciebie.</Typography>
                        ) : (
                            <Grid container spacing={3} alignItems="stretch" sx={{ mb: 8 }}>
                                {myGroups.map(g => (
                                    <Grid key={g.groupId} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                        <GroupItem group={g} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* Dołączone */}
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 3, px: 1 }}>
                            {t('groups_joined') || "Grupy, do których należę"}
                        </Typography>

                        {joinedGroups.length === 0 ? (
                            <Typography color="text.secondary" sx={{ px: 1, opacity: 0.7 }}>Nie należysz jeszcze do żadnej innej grupy.</Typography>
                        ) : (
                            <Grid container spacing={3} alignItems="stretch">
                                {joinedGroups.map(g => (
                                    <Grid key={g.groupId} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
                                        <GroupItem group={g} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* MODAL TWORZENIA */}
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px' } }}>
                    <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{t('create_group_header') || "Utwórz nową grupę"}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus margin="dense" label={t('group_name_label') || "Nazwa grupy"}
                            fullWidth variant="outlined"
                            value={newName} onChange={e => setNewName(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                        <TextField
                            margin="dense" label={t('group_desc_label') || "Opis"}
                            fullWidth multiline rows={4} variant="outlined"
                            value={newDesc} onChange={e => setNewDesc(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setOpenModal(false)} color="inherit">{t('btn_cancel')}</Button>
                        <Button onClick={handleCreate} variant="contained" disabled={creating || !newName} sx={{ borderRadius: '10px', px: 4, fontWeight: 700 }}>
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