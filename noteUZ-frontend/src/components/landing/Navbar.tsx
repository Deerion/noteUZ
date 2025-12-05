import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { AppBar, Toolbar, Box, Typography, InputBase, Button as MuiButton, useTheme, alpha } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';

// Zakładam, że te komponenty istnieją, skoro były importowane w oryginale
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavbarProps {
    isLoggedIn: boolean | null;
    onLogout: () => void;
    busy: boolean;
}

export const Navbar = ({ isLoggedIn, onLogout, busy }: NavbarProps) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                // Tło (zachowane z Twojego kodu)
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(10,10,10,0.7)',

                // POPRAWKA: Wymuszamy kolor tekstu/ikon zależny od motywu.
                // W trybie light będzie czarny, w dark biały.
                color: 'text.primary',

                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: 50,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 1 }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
                    }}>
                        <MenuBookIcon sx={{ fontSize: 22, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
                        NoteUZ
                    </Typography>
                </Box>

                {/* Search Bar (Desktop) */}
                <Box sx={{ flex: 1, maxWidth: 500, display: { xs: 'none', md: 'block' }, mx: 4 }}>
                    <Box sx={{
                        position: 'relative',
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.text.primary, 0.04),
                        '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.06) },
                    }}>
                        <Box sx={{ position: 'absolute', left: 12, top: 9, color: 'text.secondary' }}>
                            <SearchIcon fontSize="small" />
                        </Box>
                        <InputBase
                            placeholder={t('search')}
                            sx={{ width: '100%', py: 0.5, pl: 5, pr: 2, fontSize: '0.9rem', color: 'inherit' }}
                        />
                    </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Teraz ThemeToggle odziedziczy kolor 'text.primary' z AppBar */}
                    <ThemeToggle />
                    <LanguageSwitcher />


                    {isLoggedIn ? (
                        <>
                            <MuiButton
                                component={Link}
                                href="/dashboard"
                                variant="outlined"
                                color="inherit"
                                size="small"
                                sx={{ borderRadius: '8px', borderColor: 'divider', textTransform: 'none', fontWeight: 600 }}
                            >
                                Mój Profil
                            </MuiButton>
                            <MuiButton
                                onClick={onLogout}
                                variant="contained"
                                color="primary"
                                disabled={busy}
                                size="small"
                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                            >
                                {busy ? '...' : t('logout')}
                            </MuiButton>
                        </>
                    ) : (
                        <>
                            <MuiButton
                                component={Link}
                                href="/login"
                                color="inherit"
                                sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}
                            >
                                {t('login')}
                            </MuiButton>
                            <MuiButton
                                component={Link}
                                href="/register"
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }}
                            >
                                {t('register')}
                            </MuiButton>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};