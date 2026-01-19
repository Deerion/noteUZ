import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Stack, Avatar, Chip, IconButton, Tooltip
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// Definicja typu
export interface AdminUser {
    id: string;
    email: string;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
    isBanned: boolean;
    warnings: number;
    displayName?: string;
}

interface UsersTableProps {
    users: AdminUser[];
    currentUserRole: 'USER' | 'MODERATOR' | 'ADMIN';
    onPromote: (id: string) => void;
    onDemote: (id: string) => void;
    onToggleBan: (id: string, isBanned: boolean) => void;
    onWarn: (id: string) => void;
    onUnwarn: (id: string) => void;
    onDelete: (id: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
                                                          users, currentUserRole, onPromote, onDemote, onToggleBan, onWarn, onUnwarn, onDelete
                                                      }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Użytkownik</TableCell>
                        <TableCell>Rola</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ostrzeżenia</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(u => (
                        <TableRow key={u.id} hover>
                            <TableCell>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {/* ZMIANA TUTAJ: Dodano src wskazujący na proxy-avatar */}
                                    <Avatar
                                        src={`/api/proxy-avatar/${u.id}`}
                                        alt={u.displayName || u.email}
                                    >
                                        {(u.displayName || u.email || '?')[0].toUpperCase()}
                                    </Avatar>

                                    <Stack>
                                        <Typography variant="subtitle2">{u.displayName || 'Brak nazwy'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                                    </Stack>
                                </Stack>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={u.role}
                                    color={u.role === 'ADMIN' ? 'error' : u.role === 'MODERATOR' ? 'secondary' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                {u.isBanned ?
                                    <Chip label="ZBANOWANY" color="error" size="small" /> :
                                    <Chip label="Aktywny" color="success" size="small" variant="outlined" />
                                }
                            </TableCell>
                            <TableCell align="center">
                                <Typography fontWeight="bold" color={u.warnings > 0 ? 'warning.main' : 'text.secondary'}>
                                    {u.warnings}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                {u.role !== 'ADMIN' && (
                                    <>
                                        {u.role === 'USER' ? (
                                            <Tooltip title="Awansuj na Moderatora">
                                                <IconButton onClick={() => onPromote(u.id)} color="primary" size="small">
                                                    <ArrowUpwardIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Zdegraduj do Usera">
                                                <IconButton onClick={() => onDemote(u.id)} color="warning" size="small">
                                                    <ArrowDownwardIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title={u.isBanned ? "Odbanuj" : "Zbanuj"}>
                                            <IconButton onClick={() => onToggleBan(u.id, u.isBanned)} color={u.isBanned ? "success" : "default"} size="small">
                                                {u.isBanned ? <CheckCircleIcon /> : <BlockIcon />}
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Daj ostrzeżenie">
                                            <IconButton onClick={() => onWarn(u.id)} color="warning" size="small">
                                                <WarningAmberIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {u.warnings > 0 && (
                                            <Tooltip title="Cofnij ostrzeżenie">
                                                <IconButton onClick={() => onUnwarn(u.id)} color="success" size="small">
                                                    <RemoveCircleIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        {currentUserRole === 'ADMIN' && (
                                            <Tooltip title="Usuń konto trwale">
                                                <IconButton onClick={() => onDelete(u.id)} color="error" size="small">
                                                    <PersonRemoveIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">Brak użytkowników.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};