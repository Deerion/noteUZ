import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert,
    TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Button, Snackbar, Avatar
} from '@mui/material';

// Ikony
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import NoteIcon from '@mui/icons-material/Note';
import GroupsIcon from '@mui/icons-material/Groups';

// Komponenty
import { StatCard } from '@/components/AdminPanel/StatCard';
import { UsersTable, AdminUser } from '@/components/AdminPanel/UsersTable';
import { NotesTable, AdminNote } from '@/components/AdminPanel/NotesTable';
import { GroupsTable, AdminGroup } from '@/components/AdminPanel/GroupsTable';
import { Navbar } from '@/components/landing/Navbar';

// API & Types
import { apiFetch } from '@/lib/api';
import { UserData } from '@/types/User';

interface ConfirmDialogState {
    open: boolean;
    title: string;
    content: string;
    action: (() => Promise<void>) | null;
    isDestructive?: boolean;
}

export default function AdminPage() {
    const { t } = useTranslation('common');
    const router = useRouter();

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<'USER' | 'MODERATOR' | 'ADMIN'>('USER');

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [notes, setNotes] = useState<AdminNote[]>([]);
    const [groups, setGroups] = useState<AdminGroup[]>([]);

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', content: '', action: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

    useEffect(() => {
        apiFetch<UserData>('/api/auth/me')
            .then(user => {
                if (!user.role || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
                    router.replace('/dashboard');
                    return;
                }
                setCurrentUser(user);
                setCurrentUserRole(user.role);
                fetchAll();
            })
            .catch(() => {
                router.replace('/login');
            });
    }, [router]);

    const fetchAll = async () => {
        try {
            const [usersData, notesData, groupsData] = await Promise.all([
                apiFetch<AdminUser[]>('/api/admin/users'),
                apiFetch<AdminNote[]>('/api/admin/notes'),
                apiFetch<AdminGroup[]>('/api/admin/groups')
            ]);

            setUsers(usersData);
            setNotes(notesData);
            setGroups(groupsData);
        } catch (e) {
            console.error(e);
            setError("Błąd pobierania danych lub brak uprawnień.");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });
    const openConfirm = (title: string, content: string, action: () => Promise<void>, isDestructive = false) =>
        setConfirmDialog({ open: true, title, content, action, isDestructive });

    const handleConfirmAction = async () => {
        if (confirmDialog.action) {
            try { await confirmDialog.action(); showSnackbar(t('success_op'), "success"); }
            catch (e) { showSnackbar("Operacja nieudana.", "error"); }
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
        fetchAll();
    };

    const filteredUsers = useMemo(() => users.filter(u =>
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    const filteredNotes = useMemo(() => notes.filter(n =>
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.authorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [notes, searchTerm]);

    const filteredGroups = useMemo(() => groups.filter(g =>
        (g.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [groups, searchTerm]);

    if (loading || !currentUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            <Navbar user={currentUser} onLogout={() => router.push('/login')} busy={loading} hideSearch={true} />

            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, mt: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}><SecurityIcon /></Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="text.primary">{t('admin_panel')}</Typography>
                        <Typography variant="body1" color="text.secondary">Zalogowano jako: <b>{currentUserRole}</b></Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 3,
                    mb: 4
                }}>
                    <StatCard title={t('stat_users')} value={users.length} icon={<PeopleIcon />} colorType="primary" />
                    <StatCard title={t('stat_notes')} value={notes.length} icon={<NoteIcon />} colorType="secondary" />
                    <StatCard title={t('stat_groups')} value={groups.length} icon={<GroupsIcon />} colorType="warning" />
                </Box>

                <Paper sx={{ mb: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                    <Box sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Tabs
                            value={tab}
                            onChange={(e, v) => setTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label={t('tab_users')} />
                            <Tab label="Notatki" />
                            <Tab label="Grupy" />
                        </Tabs>

                        <TextField
                            size="small"
                            placeholder="Szukaj..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        />
                    </Box>

                    {tab === 0 && (
                        <UsersTable
                            users={filteredUsers}
                            currentUserRole={currentUserRole}
                            onPromote={(id) => openConfirm("Mianować Moderatorem?", "Nadajesz uprawnienia.", async () => apiFetch(`/api/admin/users/${id}/promote`, { method: 'POST' }))}
                            onDemote={(id) => openConfirm("Zdegradować?", "Odbierasz uprawnienia.", async () => apiFetch(`/api/admin/users/${id}/demote`, { method: 'POST' }), true)}
                            onToggleBan={(id, isBanned) => openConfirm(isBanned ? "Odbanować?" : "Zbanować?", "Zmieniasz status dostępu.", async () => apiFetch(`/api/admin/users/${id}/ban`, { method: 'POST' }), !isBanned)}
                            onWarn={(id) => openConfirm("Ostrzeżenie", "Dodać ostrzeżenie?", async () => apiFetch(`/api/admin/users/${id}/warn`, { method: 'POST' }), true)}
                            onUnwarn={(id) => openConfirm("Cofnąć ostrzeżenie?", "Czy na pewno chcesz usunąć ostrzeżenie?", async () => apiFetch(`/api/admin/users/${id}/unwarn`, { method: 'POST' }), false)}
                            onDelete={(id) => openConfirm("Usunąć konto?", "Operacja nieodwracalna.", async () => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }), true)}
                        />
                    )}

                    {tab === 1 && (
                        <NotesTable
                            notes={filteredNotes}
                            onDelete={(id) => openConfirm("Usunąć notatkę?", "Nieodwracalne.", async () => apiFetch(`/api/admin/notes/${id}`, { method: 'DELETE' }), true)}
                        />
                    )}

                    {tab === 2 && (
                        <GroupsTable
                            groups={filteredGroups}
                            onDelete={(id) => openConfirm("Usunąć grupę?", "Nieodwracalne.", async () => apiFetch(`/api/admin/groups/${id}`, { method: 'DELETE' }), true)}
                        />
                    )}
                </Paper>
            </Box>

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent><DialogContentText>{confirmDialog.content}</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>Anuluj</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color={confirmDialog.isDestructive ? "error" : "primary"}>Potwierdź</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});