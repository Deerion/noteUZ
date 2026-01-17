import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Typography, Chip, Box, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemAvatar, ListItemText, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import CrownIcon from '@mui/icons-material/EmojiEvents'; // Ikona korony dla właściciela

// Zaktualizowany interfejs pasujący do nowego DTO z Backend'u
export interface GroupMemberDTO {
    name: string;
    email: string;
    role: string;
}

export interface AdminGroup {
    id: string;
    name: string;
    description: string;
    ownerName: string;
    ownerEmail: string;
    memberCount: number;
    noteCount: number;
    createdAt: string;
    members: GroupMemberDTO[]; // Lista członków
}

interface GroupsTableProps {
    groups: AdminGroup[];
    onDelete: (id: string) => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({ groups, onDelete }) => {
    const [viewGroup, setViewGroup] = useState<AdminGroup | null>(null);

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="25%">Grupa</TableCell>
                            <TableCell width="25%">Właściciel</TableCell>
                            <TableCell width="20%">Statystyki</TableCell>
                            <TableCell width="20%">Data utworzenia</TableCell>
                            <TableCell align="right" width="10%">Akcje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map(g => (
                            <TableRow key={g.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <GroupsIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="bold" variant="body2">{g.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                                {g.description || "Brak opisu"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">{g.ownerName}</Typography>
                                        <Chip
                                            label="OWNER"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">{g.ownerEmail}</Typography>
                                </TableCell>

                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            icon={<PersonIcon />}
                                            label={g.memberCount}
                                            size="small"
                                            variant="outlined"
                                            title="Liczba członków"
                                        />
                                        <Chip
                                            icon={<NoteIcon />}
                                            label={g.noteCount}
                                            size="small"
                                            variant="outlined"
                                            title="Liczba notatek"
                                        />
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(g.createdAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>

                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Tooltip title="Szczegóły i członkowie">
                                            <IconButton onClick={() => setViewGroup(g)} color="info" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Usuń grupę">
                                            <IconButton onClick={() => onDelete(g.id)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {groups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">Brak grup w systemie.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- MODAL SZCZEGÓŁÓW GRUPY --- */}
            <Dialog
                open={!!viewGroup}
                onClose={() => setViewGroup(null)}
                maxWidth="sm"
                fullWidth
            >
                {viewGroup && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><GroupsIcon /></Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">{viewGroup.name}</Typography>
                                <Typography variant="caption" color="text.secondary">ID: {viewGroup.id}</Typography>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ mt: 2 }}>
                            {viewGroup.description && (
                                <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">Opis:</Typography>
                                    <Typography variant="body2">{viewGroup.description}</Typography>
                                </Box>
                            )}

                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Członkowie ({viewGroup.members.length}):
                            </Typography>

                            <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                                {viewGroup.members.map((member, idx) => (
                                    <React.Fragment key={idx}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar>{member.name[0].toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {member.name}
                                                        {member.role === 'OWNER' && <CrownIcon color="warning" fontSize="small" />}
                                                    </Box>
                                                }
                                                secondary={`${member.email} • ${member.role}`}
                                            />
                                        </ListItem>
                                        {idx < viewGroup.members.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setViewGroup(null)}>Zamknij</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};