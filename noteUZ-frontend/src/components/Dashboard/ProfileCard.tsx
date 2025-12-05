import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Box, Card, CardContent, Avatar, Typography, Chip, Divider, Button, useTheme, alpha, CircularProgress, IconButton } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NoteIcon from '@mui/icons-material/DescriptionOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useTranslation } from 'next-i18next'; // <--- DODANO
import { UserData } from '@/types/User';
import { useRouter } from 'next/router';

interface ProfileCardProps {
    user: UserData;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
    const { t } = useTranslation('common'); // <--- DODANO
    const theme = useTheme();
    const router = useRouter();
    const displayName = user.user_metadata?.display_name || t('username'); // Użycie tłumaczenia dla fallbacku
    const initial = displayName.charAt(0).toUpperCase();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(`/api/proxy-avatar/${user.id}?t=${Date.now()}`);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert(t('file_too_big'));
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setAvatarUrl(`/api/proxy-avatar/${user.id}?t=${Date.now()}`);
            } else {
                alert(t('upload_error'));
            }
        } catch (e) {
            console.error(e);
            alert(t('connection_error'));
        } finally {
            setUploading(false);
        }
    };

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

                <Box sx={{ position: 'relative', width: 110, height: 110, mx: 'auto', mb: 2 }}>
                    <Avatar
                        src={avatarUrl}
                        key={avatarUrl}
                        sx={{
                            width: 110,
                            height: 110,
                            fontSize: '2.5rem',
                            bgcolor: 'background.paper',
                            color: theme.palette.primary.main,
                            border: '4px solid',
                            borderColor: 'background.paper',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        }}
                    >
                        {!uploading && initial}
                    </Avatar>

                    {uploading && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '50%' }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        color="primary"
                        size="small"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                    >
                        <PhotoCameraIcon fontSize="small" />
                    </IconButton>

                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg"
                    />
                </Box>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {displayName}
                </Typography>

                <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: '16px !important' }} />}
                    label={t('verified_account')}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ mb: 3, fontWeight: 600, border: 'none', bgcolor: alpha(theme.palette.success.main, 0.1) }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {t('manage_notes_desc')}
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
                        {t('notes')}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};