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
import { useTranslation } from 'next-i18next';

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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const NotesTable: React.FC<NotesTableProps> = ({ notes, onDelete }) => {
    const { t } = useTranslation('common');
    const [viewNote, setViewNote] = useState<AdminNote | null>(null);

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="30%">{t('col_title')}</TableCell>
                            <TableCell width="25%">{t('col_author')}</TableCell>
                            <TableCell width="25%">{t('groups_title')}</TableCell>
                            <TableCell width="20%">{t('col_created_at')}</TableCell>
                            <TableCell align="right" width="10%">{t('col_actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notes.map(n => (
                            <TableRow key={n.id} hover>
                                <TableCell>
                                    <Typography fontWeight="bold" variant="body2">
                                        {n.title || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>{t('note_untitled')}</span>}
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
                                            label={t('my_notes')}
                                            size="small"
                                            variant="outlined"
                                            sx={{ opacity: 0.5 }}
                                        />
                                    )}
                                </TableCell>

                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(n.createdAt)}
                                    </Typography>
                                </TableCell>

                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tooltip title={t('btn_open')}>
                                            <IconButton onClick={() => setViewNote(n)} color="info" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('action_delete_note')}>
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
                                    <Typography color="text.secondary">{t('no_data')}</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                                {viewNote.title || t('note_untitled')}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                                    <PersonIcon fontSize="small" />
                                    <Typography variant="caption">{viewNote.authorName}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.7 }}>
                                    <CalendarTodayIcon fontSize="small" />
                                    <Typography variant="caption">{formatDate(viewNote.createdAt)}</Typography>
                                </Box>
                                {viewNote.isGroupNote && (
                                    <Chip label={`${t('groups_title')}: ${viewNote.groupName}`} size="small" color="primary" variant="outlined" />
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
                            <Button onClick={() => setViewNote(null)}>{t('common.cancel')}</Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    onDelete(viewNote.id);
                                    setViewNote(null);
                                }}
                            >
                                {t('action_delete_note')}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};