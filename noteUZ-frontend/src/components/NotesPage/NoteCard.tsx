import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, Typography, Box, IconButton, useTheme, alpha, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Note } from '@/types/Note';
import { apiFetch } from '@/lib/api';
import { useTranslation } from 'next-i18next';

interface NoteCardProps {
    note: Note;
    onEdit?: (note: Note) => void;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    showVotes?: boolean;
    rank?: number;
}

function stripMarkdown(text: string): string {
    if (!text) return '';
    return text.replace(/[#*`_~\[\]]/g, '').replace(/\n+/g, ' ').trim();
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, showActions = true, showVotes = false, rank }) => {
    const { t, i18n } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const [votes, setVotes] = useState(note.voteCount || 0);
    const [voted, setVoted] = useState(note.votedByMe || false);
    const [isVoting, setIsVoting] = useState(false);

    const dateStr = note.createdAt || note.created_at;
    const cleanContent = stripMarkdown(note.content || '');
    const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'pl-PL', { month: 'short', day: 'numeric' })
        : '';

    const handleVote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isVoting) return;
        setIsVoting(true);
        const prevVotes = votes;
        const prevVoted = voted;
        const newVoted = !voted;
        setVoted(newVoted);
        setVotes(prev => newVoted ? prev + 1 : prev - 1);
        try {
            const response = await apiFetch<any>(`/api/notes/${note.id}/vote`, { method: 'POST' });
            if (response && typeof response.voteCount === 'number') {
                setVotes(response.voteCount);
                setVoted(response.votedByMe);
            }
        } catch (error) {
            setVoted(prevVoted);
            setVotes(prevVotes);
        } finally { setIsVoting(false); }
    };

    const handleClick = () => {
        if (onEdit) onEdit(note);
        else router.push(`/notes/${note.id}`);
    };

    return (
        <Card
            elevation={0}
            onClick={handleClick}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: rank === 1 ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider,
                backgroundColor: rank === 1 ? alpha(theme.palette.primary.main, 0.02) : theme.palette.background.paper,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    borderColor: theme.palette.primary.main,
                }
            }}
        >
            <CardContent sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                '&:last-child': { pb: 3 }
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 700,
                        fontSize: '1.15rem',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {note.title || <span style={{ opacity: 0.4 }}>{t('note_untitled')}</span>}
                    </Typography>

                    {showVotes && (
                        <Box
                            onClick={handleVote}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: '8px',
                                bgcolor: voted ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.action.hover, 0.05),
                                color: voted ? theme.palette.error.main : theme.palette.text.secondary,
                                transition: '0.2s',
                                flexShrink: 0
                            }}
                        >
                            <Typography variant="caption" fontWeight={800}>{votes}</Typography>
                            {voted ? <FavoriteIcon sx={{ fontSize: 14 }} /> : <FavoriteBorderIcon sx={{ fontSize: 14 }} />}
                        </Box>
                    )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{
                    mb: 3,
                    lineHeight: 1.6,
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {cleanContent || t('note_no_content')}
                </Typography>

                <Box sx={{
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.5),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Stack direction="row" alignItems="center" spacing={1} color="text.disabled">
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={600}>{formattedDate}</Typography>
                    </Stack>

                    {showActions && (
                        <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                            {onEdit && (
                                <IconButton size="small" onClick={() => onEdit(note)}>
                                    <EditIcon fontSize="small" sx={{ fontSize: 18 }} />
                                </IconButton>
                            )}
                            {onDelete && (
                                <IconButton size="small" onClick={() => onDelete(note.id)} color="error">
                                    <DeleteIcon fontSize="small" sx={{ fontSize: 18 }} />
                                </IconButton>
                            )}
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};