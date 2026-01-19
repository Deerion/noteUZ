import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Typography, Chip, Box, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export interface AdminNote {
    id: string;
    title: string;
    content: string;
    authorName: string;
    groupName?: string;
    isGroupNote: boolean;
    createdAt: string;
}

interface NotesTableProps {
    notes: AdminNote[];
    onDelete: (id: string) => void;
}

// Funkcja pomocnicza do formatowania daty na polski czas
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw', // Wymuszamy polską strefę czasową
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const NotesTable: React.FC<NotesTableProps> = ({ notes, onDelete }) => {
    const [viewNote, setViewNote] = useState<AdminNote | null>(null);

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="30%">Tytuł</TableCell>
                            <TableCell width="25%">Autor</TableCell>
                            <TableCell width="25%">Kontekst (Grupa)</TableCell>
                            <TableCell width="20%">Data</TableCell>
                            <TableCell align="right" width="10%">Akcje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notes.map(n => (
                            <TableRow key={n.id} hover>
                                <TableCell>
                                    <Typography fontWeight="bold" variant="body2">
                                        {n.title || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Bez tytułu</span>}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" color="action" />
                                        <Typography variant="body2">{n.authorName}</Typography>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    {n.isGroupNote ? (
                                        <Chip
                                            icon={<GroupsIcon />}
                                            label={n.groupName}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip
                                            label="Prywatna"
                                            size="small"
                                            variant="outlined"
                                            sx={{ opacity: 0.5 }}
                                        />
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {/* Używamy nowej funkcji formatującej */}
                                        {formatDate(n.createdAt)}
                                    </Typography>
                                </TableCell>

                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tooltip title="Podgląd notatki">
                                            <IconButton onClick={() => setViewNote(n)} color="info" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Usuń notatkę">
                                            <IconButton onClick={() => onDelete(n.id)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {notes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Brak notatek w systemie.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- MODAL PODGLĄDU NOTATKI --- */}
            <Dialog
                open={!!viewNote}
                onClose={() => setViewNote(null)}
                maxWidth="md"
                fullWidth
            >
                {viewNote && (
                    <>
                        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">
                                {viewNote.title || "Notatka bez tytułu"}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                                    <PersonIcon fontSize="small" />
                                    <Typography variant="caption">{viewNote.authorName}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                                    <CalendarTodayIcon fontSize="small" />
                                    {/* Tutaj też formatujemy datę */}
                                    <Typography variant="caption">{formatDate(viewNote.createdAt)}</Typography>
                                </Box>
                                {viewNote.isGroupNote && (
                                    <Chip label={`Grupa: ${viewNote.groupName}`} size="small" color="primary" variant="outlined" />
                                )}
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ mt: 2, minHeight: '200px' }}>
                            <Box sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                    {viewNote.content}
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setViewNote(null)}>Zamknij</Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    onDelete(viewNote.id);
                                    setViewNote(null);
                                }}
                            >
                                Usuń notatkę
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};