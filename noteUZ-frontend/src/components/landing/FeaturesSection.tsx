// src/components/landing/FeaturesSection.tsx
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Typography, Grid } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import { FeatureCard } from './FeatureCard';

export const FeaturesSection = () => {
    const { t } = useTranslation('common');

    return (
        <Box id="features" sx={{ scrollMarginTop: '100px' }}>
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
                {t('features_title')} {/* <--- ZMIANA */}
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                {t('features_subtitle')} {/* <--- ZMIANA */}
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<AutoAwesomeIcon fontSize="large" />}
                        title={t('feature_simple_title')}
                        desc={t('feature_simple_desc')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<BoltIcon fontSize="large" />}
                        title={t('feature_speed_title')}
                        desc={t('feature_speed_desc')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<SecurityIcon fontSize="large" />}
                        title={t('feature_security_title')}
                        desc={t('feature_security_desc')}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};