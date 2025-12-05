// src/components/Dashboard/ProfileCard.tsx
import React from 'react';
import Link from 'next/link';
import { Box, Card, CardContent, Avatar, Typography, Chip, Divider, Button, useTheme, alpha } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NoteIcon from '@mui/icons-material/DescriptionOutlined';
import { UserData } from '@/types/User';

interface ProfileCardProps {
    user: UserData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    const theme = useTheme();
    const displayName = user.user_metadata?.display_name || 'Użytkownik';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <Card elevation={0} sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
            <Box sx={{
                height: 120,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                borderRadius: '24px 24px 0 0',
                position: 'relative'
            }} />

            <CardContent sx={{ pt: 0, px: 3, pb: 4, textAlign: 'center', mt: -6 }}>
                <Avatar sx={{
                    width: 110,
                    height: 110,
                    fontSize: '2.5rem',
                    bgcolor: 'background.paper',
                    color: theme.palette.primary.main,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    mx: 'auto',
                    mb: 2
                }}>
                    {initial}
                </Avatar>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {displayName}
                </Typography>

                <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: '16px !important' }} />}
                    label="Konto zweryfikowane"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ mb: 3, fontWeight: 600, border: 'none', bgcolor: alpha(theme.palette.success.main, 0.1) }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Zarządzaj swoimi notatkami i ustawieniami konta w jednym miejscu.
                </Typography>

                <Link href="/notes" legacyBehavior passHref>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<NoteIcon />}
                        sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            fontWeight: 700,
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                    >
                        Przejdź do notatek
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};