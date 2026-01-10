import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, Chip, Tabs, Tab,
    CircularProgress, Alert, Tooltip, Grid, Card, CardContent, TextField, InputAdornment, useTheme,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Stack, Avatar, Divider
} from '@mui/material';

// Ikony
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import NoteIcon from '@mui/icons-material/Note';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

import { apiFetch } from '@/lib/api';
import { UserData } from '@/types/User';
import { Note } from '@/types/Note';
import { Navbar } from '@/components/landing/Navbar';

// --- TYPY ---

// Backend zwraca userId (camelCase), frontend typuje to jako user_id
// Rozszerzamy typ, aby TypeScript nie krzyczał przy obsłudze obu wersji
interface AdminNote extends Note {
    userId?: string;
}

interface AdminUser extends UserData {
    isAdmin: boolean;
    isBanned: boolean;
    warningCount: number;
    displayName: string;
}

interface AdminGroup {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

interface ConfirmDialogState {
    open: boolean;
    title: string;
    content: string;
    action: (() => Promise<void>) | null;
    isDestructive?: boolean;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
}

// --- KOMPONENTY UI ---

const StatCard = ({ title, value, icon, colorType }: { title: string, value: number, icon: React.ReactNode, colorType: 'primary' | 'secondary' | 'warning' }) => {
    const theme = useTheme();
    const color = theme.palette[colorType].main;

    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 'none' }}>
            <Box sx={{
                position: 'absolute', right: -15, top: -15,
                opacity: 0.1, fontSize: 100, color: color,
                transform: 'rotate(-10deg)'
            }}>
                {icon}
            </Box>
            <CardContent>
                <Typography color="text.secondary" variant="overline" fontWeight="bold" letterSpacing={1}>
                    {title}
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: color, mt: 1 }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default function AdminPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    // --- STATE ---
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    // Data
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [notes, setNotes] = useState<AdminNote[]>([]);
    const [groups, setGroups] = useState<AdminGroup[]>([]);

    // Modals
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', content: '', action: null });
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });

    // --- INITIALIZATION ---
    useEffect(() => {
        apiFetch<UserData>('/api/auth/me')
            .then(user => {
                if (!user.isAdmin) {
                    router.push('/');
                } else {
                    setCurrentUser(user);
                    fetchAll();
                }
            })
            .catch(() => router.push('/login'));
    }, [router]);

    const fetchAll = async () => {
        setLoading(true);
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
            setError("Nie udało się pobrać danych administratora.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try { await apiFetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); } catch (e) { }
    };

    // --- FILTERING ---
    const filteredUsers = useMemo(() => users.filter(u =>
        (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    const filteredNotes = useMemo(() => notes.filter(n =>
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [notes, searchTerm]);

    const filteredGroups = useMemo(() => groups.filter(g =>
        (g.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [groups, searchTerm]);

    // --- UI HELPERS ---
    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => setSnackbar({ open: true, message, severity });
    const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
    const openConfirm = (title: string, content: string, action: () => Promise<void>, isDestructive = false) => setConfirmDialog({ open: true, title, content, action, isDestructive });
    const handleConfirmClose = () => setConfirmDialog(prev => ({ ...prev, open: false }));
    const handleConfirmAction = async () => {
        if (confirmDialog.action) {
            try { await confirmDialog.action(); showSnackbar("Operacja zakończona sukcesem", "success"); }
            catch (e) { showSnackbar("Wystąpił błąd", "error"); }
        }
        handleConfirmClose();
        fetchAll();
    };

    // --- ACTIONS ---
    const clickToggleRole = (id: string) => openConfirm("Zmiana roli", "Czy na pewno zmienić uprawnienia administratora?", async () => apiFetch(`/api/admin/users/${id}/role`, { method: 'POST' }));
    const clickToggleBan = (id: string, isBanned: boolean) => openConfirm(isBanned ? "Odblokuj" : "Zablokuj", `Czy na pewno ${isBanned ? "odblokować" : "zablokować"} konto?`, async () => apiFetch(`/api/admin/users/${id}/ban`, { method: 'POST' }), !isBanned);
    const clickWarn = (id: string) => openConfirm("Ostrzeżenie", "Wysłać oficjalne ostrzeżenie użytkownikowi?", async () => apiFetch(`/api/admin/users/${id}/warn`, { method: 'POST' }), true);
    const clickDeleteUser = (id: string) => openConfirm("Usuń użytkownika", "UWAGA: To usunie użytkownika i wszystkie jego dane bezpowrotnie. Kontynuować?", async () => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }), true);

    const clickDeleteNote = (id: string) => openConfirm("Usuń notatkę", "Tej operacji nie można cofnąć.", async () => apiFetch(`/api/admin/notes/${id}`, { method: 'DELETE' }), true);
    const clickDeleteGroup = (id: string) => openConfirm("Usuń grupę", "Grupa zostanie trwale usunięta.", async () => apiFetch(`/api/admin/groups/${id}`, { method: 'DELETE' }), true);

    if (!currentUser && loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            <Navbar user={currentUser} onLogout={handleLogout} busy={loading} hideSearch={true} />

            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, mt: 4 }}>

                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <SecurityIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            Centrum Zarządzania
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Panel Administratora NoteUZ
                        </Typography>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                {/* Dashboard Stats (BEZ LOGÓW) */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard title="Użytkownicy" value={users.length} icon={<PeopleIcon />} colorType="primary" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard title="Notatki" value={notes.length} icon={<NoteIcon />} colorType="secondary" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard title="Grupy" value={groups.length} icon={<GroupsIcon />} colorType="warning" />
                    </Grid>
                </Grid>

                {/* Main Content Area */}
                <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>

                    {/* Toolbar */}
                    <Box sx={{
                        p: 2, borderBottom: '1px solid', borderColor: 'divider',
                        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between', alignItems: 'center', gap: 2,
                        bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'
                    }}>
                        <Tabs
                            value={tab}
                            onChange={(e, v) => setTab(v)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{ minHeight: 48 }}
                        >
                            <Tab icon={<PeopleIcon sx={{ fontSize: 18 }}/>} iconPosition="start" label="Użytkownicy" sx={{ fontWeight: 600, minHeight: 48 }} />
                            <Tab icon={<NoteIcon sx={{ fontSize: 18 }}/>} iconPosition="start" label="Notatki" sx={{ fontWeight: 600, minHeight: 48 }} />
                            <Tab icon={<GroupsIcon sx={{ fontSize: 18 }}/>} iconPosition="start" label="Grupy" sx={{ fontWeight: 600, minHeight: 48 }} />
                        </Tabs>

                        <TextField
                            size="small"
                            placeholder="Filtruj listę..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment>),
                            }}
                            sx={{ width: { xs: '100%', md: 300 } }}
                        />
                    </Box>

                    {/* --- TABELA UŻYTKOWNIKÓW --- */}
                    {tab === 0 && (
                        <TableContainer>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>Użytkownik</TableCell>
                                        <TableCell align="center">Rola</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                        <TableCell align="center">Ostrzeżenia</TableCell>
                                        <TableCell align="right">Akcje</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.map(u => (
                                        <TableRow key={u.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{u.displayName?.charAt(0).toUpperCase()}</Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>{u.displayName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                {u.isAdmin ?
                                                    <Chip label="ADMIN" size="small" color="primary" sx={{ fontWeight: 700, borderRadius: 1 }} />
                                                    :
                                                    <Chip label="User" size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                {u.isBanned ?
                                                    <Chip label="ZBANOWANY" color="error" size="small" icon={<BlockIcon />} sx={{ borderRadius: 1 }} />
                                                    :
                                                    <Chip label="Aktywny" color="success" size="small" variant="outlined" icon={<CheckCircleIcon />} sx={{ borderRadius: 1 }} />
                                                }
                                            </TableCell>
                                            <TableCell align="center">
                                                {u.warningCount > 0 ?
                                                    <Chip label={u.warningCount} color="warning" size="small" sx={{ borderRadius: 1, minWidth: 30 }} />
                                                    : <Typography variant="body2" color="text.secondary">-</Typography>
                                                }
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Zmień rolę">
                                                    <IconButton size="small" onClick={() => clickToggleRole(u.id)} color="primary"><SecurityIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                                <Tooltip title={u.isBanned ? "Odblokuj" : "Zablokuj"}>
                                                    <IconButton size="small" onClick={() => clickToggleBan(u.id, u.isBanned)} color={u.isBanned ? 'success' : 'default'}>
                                                        {u.isBanned ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Ostrzeżenie">
                                                    <IconButton size="small" onClick={() => clickWarn(u.id)} color="warning"><WarningAmberIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                                <Tooltip title="Usuń użytkownika">
                                                    <IconButton size="small" onClick={() => clickDeleteUser(u.id)} color="error"><PersonRemoveIcon fontSize="small" /></IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* --- TABELA NOTATEK --- */}
                    {tab === 1 && (
                        <TableContainer>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>Tytuł</TableCell>
                                        <TableCell>Treść</TableCell>
                                        <TableCell>ID Autora</TableCell>
                                        <TableCell>Data utworzenia</TableCell>
                                        <TableCell align="right">Akcje</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredNotes.map(n => {
                                        // BEZPIECZNE POBIERANIE ID (Fix dla błędu substring)
                                        const ownerId = n.userId || n.user_id || "unknown";

                                        return (
                                            <TableRow key={n.id} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{n.title || <Typography fontStyle="italic" color="text.secondary">Bez tytułu</Typography>}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {n.content}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={ownerId.length > 8 ? ownerId.substring(0, 8) : ownerId}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 20 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                                    {new Date(n.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Usuń notatkę">
                                                        <IconButton size="small" color="error" onClick={() => clickDeleteNote(n.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* --- TABELA GRUP --- */}
                    {tab === 2 && (
                        <TableContainer>
                            <Table size="medium">
                                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                                    <TableRow>
                                        <TableCell>Nazwa</TableCell>
                                        <TableCell>Opis</TableCell>
                                        <TableCell>ID Grupy</TableCell>
                                        <TableCell align="right">Akcje</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredGroups.map(g => (
                                        <TableRow key={g.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{g.name}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>{g.description}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={g.id.length > 8 ? g.id.substring(0, 8) : g.id}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem', height: 20 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Usuń grupę">
                                                    <IconButton size="small" color="error" onClick={() => clickDeleteGroup(g.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>

            {/* MODALS */}
            <Dialog open={confirmDialog.open} onClose={handleConfirmClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
                <DialogContent><DialogContentText>{confirmDialog.content}</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmClose} color="inherit">Anuluj</Button>
                    <Button onClick={handleConfirmAction} variant="contained" color={confirmDialog.isDestructive ? "error" : "primary"} autoFocus>Potwierdź</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});