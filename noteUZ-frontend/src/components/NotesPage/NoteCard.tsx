// src/components/NotesPage/NoteCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Note } from '@/types/Note';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next'; // <--- ZMIANA

interface NoteCardProps {
    note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
    const { t, i18n } = useTranslation('common'); // <--- ZMIANA
    const theme = useTheme();
    const router = useRouter();

    const content = note.content ?? '';

    const shortContent = content.length > 100
        ? content.substring(0, 100) + '...'
        : content;

    // Formatowanie daty zależne od języka
    const formattedDate = new Date(note.created_at).toLocaleDateString(
        i18n.language === 'en' ? 'en-US' : 'pl-PL',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }
    );

    const handleOpenNote = () => {
        router.push(`/notes/${note.id}`);
    };

    return (
        <Card
            elevation={0}
            onClick={handleOpenNote}
            sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 10px 20px -5px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: theme.palette.primary.main,
                    cursor: 'pointer',
                }
            }}
        >
            <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: '0.8rem' }} />
                    {formattedDate} {/* <--- ZMIANA */}
                </Typography>

                <Typography variant="h6" fontWeight={700} gutterBottom sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {note.title || t('note_untitled')} {/* <--- ZMIANA */}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{
                    lineHeight: 1.5,
                    maxHeight: '4.5em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {shortContent || t('note_no_content')} {/* <--- ZMIANA */}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                        {t('btn_open')} {/* <--- ZMIANA */}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};