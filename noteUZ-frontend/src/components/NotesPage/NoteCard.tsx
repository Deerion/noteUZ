import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, Typography, Box, IconButton, useTheme, alpha, Chip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Note } from '@/types/Note';
import { apiFetch } from '@/lib/api';
import { useTranslation } from 'next-i18next';

interface NoteCardProps {
    note: Note;
    onEdit?: (note: Note) => void;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    showVotes?: boolean;
    rank?: number; // Pozostawione dla kompatybilności wstecznej, ale PodiumItem teraz obsługuje renderowanie top 3
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

    // Obsługa rankingu wewnątrz karty (tylko tło) - jeśli używane poza PodiumItem
    let rankBorderColor = theme.palette.divider;
    let rankBg = theme.palette.background.paper;

    if (showVotes && rank === 1) {
        rankBorderColor = alpha(theme.palette.primary.main, 0.4);
        rankBg = alpha(theme.palette.primary.main, 0.04);
    }

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
            const response = await apiFetch(`/api/notes/${note.id}/vote`, { method: 'POST' });
            if (response && typeof response.voteCount === 'number') {
                setVotes(response.voteCount);
                setVoted(response.votedByMe);
            }
        } catch (error) {
            setVoted(prevVoted);
            setVotes(prevVotes);
        } finally {
            setIsVoting(false);
        }
    };

    const handleClick = () => {
        if (onEdit) onEdit(note);
        else router.push(`/notes/${note.id}`);
    };

    return (
        <Card
            onClick={handleClick}
            sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: rankBg,
                border: '1px solid',
                borderColor: rankBorderColor,
                boxShadow: 'none', // Płaski design, minimalizm
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
                    <Typography variant="h6" sx={{
                        lineHeight: 1.3, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                        {note.title || <span style={{ opacity: 0.4 }}>{t('note_untitled')}</span>}
                    </Typography>

                    {showVotes && (
                        // Minimalistyczna pigułka głosowania
                        <Box
                            onClick={handleVote}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                px: 1, py: 0.5,
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: voted ? 'transparent' : theme.palette.divider,
                                bgcolor: voted ? alpha(theme.palette.error.main, 0.1) : 'transparent',
                                color: voted ? theme.palette.error.main : theme.palette.text.secondary,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                flexShrink: 0,
                                '&:hover': {
                                    bgcolor: voted ? alpha(theme.palette.error.main, 0.2) : theme.palette.action.hover,
                                    borderColor: voted ? 'transparent' : theme.palette.text.secondary
                                }
                            }}
                        >
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>{votes}</Typography>
                            {voted ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                        </Box>
                    )}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{
                    mb: 3, flexGrow: 1, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                }}>
                    {cleanContent || t('note_no_content')}
                </Typography>

                <Stack direction="row" alignItems="center" justifyContent="space-between" pt={2} borderTop="1px solid" borderColor={alpha(theme.palette.divider, 0.5)}>
                    <Stack direction="row" alignItems="center" spacing={1} color="text.disabled">
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={500}>{formattedDate}</Typography>
                    </Stack>

                    {showActions && (
                        <Box onClick={(e) => e.stopPropagation()}>
                            {onEdit && <IconButton size="small" onClick={() => onEdit(note)} sx={{ color: 'text.secondary', '&:hover': { color: theme.palette.primary.main } }}><EditIcon fontSize="small" /></IconButton>}
                            {onDelete && <IconButton size="small" onClick={() => onDelete(note.id)} color="error" sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}><DeleteIcon fontSize="small" /></IconButton>}
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};