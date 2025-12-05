import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box, Typography, Grid } from '@mui/material'; // Grid v2
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import { FeatureCard } from './FeatureCard';

export const FeaturesSection = () => {
    const { t } = useTranslation('common');

    return (
        <Box id="features" sx={{ scrollMarginTop: '100px' }}>
            <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 1 }}>
                Wszystko czego potrzebujesz
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                Skup się na treści, my zajmiemy się resztą. Oto dlaczego warto wybrać NoteUZ.
            </Typography>

            <Grid container spacing={3}>
                {/* Zmiana składni na Grid v2: size={{...}} */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<AutoAwesomeIcon fontSize="large" />}
                        title={t('feature_simple_title') || "Intuicyjny Design"}
                        desc={t('feature_simple_desc') || "Czysty interfejs pozbawiony rozpraszaczy pozwala skupić się na tym co ważne - Twoich notatkach."}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<BoltIcon fontSize="large" />}
                        title={t('feature_speed_title') || "Błyskawiczne Działanie"}
                        desc={t('feature_speed_desc') || "Zbudowany na nowoczesnych technologiach, NoteUZ ładuje się w mgnieniu oka."}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <FeatureCard
                        icon={<SecurityIcon fontSize="large" />}
                        title={t('feature_security_title') || "Bezpieczeństwo"}
                        desc={t('feature_security_desc') || "Twoje dane są szyfrowane i bezpieczne dzięki autoryzacji opartej na Supabase."}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};