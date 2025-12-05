import React from 'react';
import { Card, CardContent, Box, Typography, Grid, Stack } from '@mui/material';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKeyOutlined';
import { useTranslation } from 'next-i18next'; // <--- DODANO
import { InfoItem } from './InfoItem';
import { UserData } from '@/types/User';

interface AccountDetailsCardProps {
    user: UserData;
}

export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({ user }) => {
    const { t } = useTranslation('common'); // <--- DODANO
    const joinDate = new Date(user.created_at).toLocaleDateString(t('language') === 'en' ? 'en-US' : 'pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

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
                        {t('account_info_title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('account_info_desc')}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                            icon={<EmailIcon />}
                            label={t('email_label')}
                            value={user.email}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                            icon={<CalendarMonthIcon />}
                            label={t('join_date_label')}
                            value={joinDate}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoItem
                            icon={<PersonIcon />}
                            label={t('uuid_label')}
                            value={user.id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoItem
                            icon={<VpnKeyIcon />}
                            label={t('auth_method_label')}
                            value="Supabase Auth (Email + Password)"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, p: 3, borderRadius: '16px', bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{t('security_title')}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t('security_desc')}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};