import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, alpha, Chip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Note } from '@/types/Note';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface NoteCardProps {
    note: Note;
}

function stripMarkdown(text: string): string {
    if (!text) return '';
    return text.replace(/[#*`_~\[\]]/g, '').replace(/\n+/g, ' ').trim();
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
    const { t, i18n } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const cleanContent = stripMarkdown(note.content || '');
    const formattedDate = new Date(note.created_at).toLocaleDateString(
        i18n.language === 'en' ? 'en-US' : 'pl-PL',
        { month: 'short', day: 'numeric' }
    );

    const handleOpenNote = () => {
        router.push(`/notes/${note.id}`);
    };

    return (
        <Card
            elevation={0}
            onClick={handleOpenNote}
            sx={{
                borderRadius: '12px',
                border: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#444'}`,
                backgroundColor: theme.palette.background.paper,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'transparent',
                    cursor: 'pointer',
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {note.title || <span style={{ opacity: 0.5 }}>{t('note_untitled')}</span>}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{
                    mb: 2,
                    lineHeight: 1.5,
                    minHeight: '3em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {cleanContent || t('note_no_content')}
                </Typography>

                <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                        icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                        label={formattedDate}
                        size="small"
                        sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: alpha(theme.palette.text.secondary, 0.08),
                            color: 'text.secondary'
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};