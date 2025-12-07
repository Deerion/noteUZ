// src/components/landing/Navbar.tsx
import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { AppBar, Toolbar, Box, Typography, InputBase, Button as MuiButton, useTheme, alpha, IconButton, Avatar, Tooltip } from '@mui/material'; // <--- Dodano Avatar, IconButton, Tooltip
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { UserData } from '@/types/User'; // <--- Import typu

import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavbarProps {
    user: UserData | null; // <--- Zmieniono z isLoggedIn na user
    onLogout: () => void;
    busy: boolean;
}

export const Navbar = ({ user, onLogout, busy }: NavbarProps) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    // Obliczamy dane do avatara tylko gdy user istnieje
    const displayName = user?.user_metadata?.display_name || 'U';
    const initial = displayName.charAt(0).toUpperCase();
    const avatarUrl = user ? `/api/proxy-avatar/${user.id}` : undefined;

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(10,10,10,0.7)',
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ThemeToggle />
                    <LanguageSwitcher />

                    {user ? (
                        <>
                            {/* Avatar zamiast przycisku tekstowego */}
                            <Tooltip title={t('my_profile') || "Mój Profil"}>
                                <IconButton
                                    component={Link}
                                    href="/dashboard"
                                    sx={{
                                        p: 0,
                                        border: '2px solid',
                                        borderColor: 'divider', // Ramka wokół avatara
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: theme.palette.primary.main }
                                    }}
                                >
                                    <Avatar
                                        src={avatarUrl}
                                        alt={displayName}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: theme.palette.primary.main,
                                            color: theme.palette.primary.contrastText,
                                            fontWeight: 700,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {/* Fallback: Jeśli src nie załaduje obrazka, pokaże literkę */}
                                        {initial}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>

                            <MuiButton
                                onClick={onLogout}
                                variant="contained"
                                color="primary"
                                disabled={busy}
                                size="small"
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    ml: 1 // Odstęp od avatara
                                }}
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