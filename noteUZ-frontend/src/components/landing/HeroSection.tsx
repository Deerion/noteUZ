import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Grid, Box, Typography, Button as MuiButton, Chip, Stack, useTheme, alpha } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { MockInterface } from './MockInterface';

interface HeroSectionProps {
    isLoggedIn: boolean | null;
}

export const HeroSection = ({ isLoggedIn }: HeroSectionProps) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    return (
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
            {/* WAŻNE: Używamy 'size' zamiast 'item xs'. To jest składnia z Twojego oryginału. */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                    <Chip
                        label="Nowość: NoteUZ v2.0"
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mb: 3, fontWeight: 600, borderColor: alpha(theme.palette.secondary.main, 0.3), bgcolor: alpha(theme.palette.secondary.main, 0.05) }}
                    />
                    <Typography
                        variant="h2"
                        component="h1"
                        fontWeight={800}
                        sx={{
                            lineHeight: 1.1,
                            mb: 2,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            letterSpacing: '-1px'
                        }}
                    >
                        {t('welcome')} <br />
                        <Box component="span" sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Prościej i Szybciej.
                        </Box>
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, maxWidth: 500, fontWeight: 400 }}>
                        {t('description') || "Odkryj nowoczesny sposób na organizację swoich myśli. NoteUZ to bezpieczna przestrzeń dla Twoich pomysłów, dostępna gdziekolwiek jesteś."}
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        {isLoggedIn ? (
                            <MuiButton
                                component={Link}
                                href="/notes"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.5, px: 4,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    boxShadow: `0 10px 25px -5px ${alpha(theme.palette.primary.main, 0.4)}`
                                }}
                            >
                                {t('notes')}
                            </MuiButton>
                        ) : (
                            <MuiButton
                                component={Link}
                                href="/register"
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.5, px: 4,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    boxShadow: `0 10px 25px -5px ${alpha(theme.palette.primary.main, 0.4)}`
                                }}
                            >
                                Rozpocznij za darmo
                            </MuiButton>
                        )}
                        <MuiButton
                            component="a"
                            href="#features"
                            variant="outlined"
                            size="large"
                            sx={{
                                borderRadius: '12px',
                                py: 1.5, px: 3,
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderColor: 'divider',
                                color: 'text.primary',
                                '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                            }}
                        >
                            Dowiedz się więcej
                        </MuiButton>
                    </Stack>
                </Box>
            </Grid>

            {/* Prawa kolumna */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <MockInterface />
            </Grid>
        </Grid>
    );
};