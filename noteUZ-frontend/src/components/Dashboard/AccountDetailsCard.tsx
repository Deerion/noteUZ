// src/components/Dashboard/AccountDetailsCard.tsx
import React from 'react';
import { Card, CardContent, Box, Typography, Grid, Stack } from '@mui/material';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKeyOutlined';
import { InfoItem } from './InfoItem';
import { UserData } from '@/types/User';

interface AccountDetailsCardProps {
    user: UserData;
}

export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({ user }) => {
    const joinDate = new Date(user.created_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <Card elevation={0} sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Informacje o koncie
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Szczegóły techniczne Twojego profilu w NoteUZ
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* POPRAWKA: Grid v2 używa 'size' zamiast 'item xs' */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                            icon={<EmailIcon />}
                            label="Adres E-mail"
                            value={user.email}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                            icon={<CalendarMonthIcon />}
                            label="Data dołączenia"
                            value={joinDate}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoItem
                            icon={<PersonIcon />}
                            label="Unikalne ID (UUID)"
                            value={user.id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoItem
                            icon={<VpnKeyIcon />}
                            label="Metoda autoryzacji"
                            value="Supabase Auth (Email + Password)"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, p: 3, borderRadius: '16px', bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>Bezpieczeństwo</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Twoje konto jest zabezpieczone standardami OAuth2 i JWT.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};