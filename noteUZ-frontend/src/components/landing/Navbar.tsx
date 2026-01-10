import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { AppBar, Toolbar, Box, Typography, InputBase, Button as MuiButton, useTheme, alpha, IconButton, Avatar, Tooltip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { UserData } from '@/types/User';

import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavbarProps {
    user: UserData | null;
    onLogout: () => void;
    busy: boolean;
    hideSearch?: boolean; // <--- NOWE: Opcja ukrycia szukajki
}

export const Navbar = ({ user, onLogout, busy, hideSearch = false }: NavbarProps) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    const displayName = user?.user_metadata?.display_name || 'U';
    const initial = displayName.charAt(0).toUpperCase();
    const avatarUrl = user ? `/api/proxy-avatar/${user.id}` : undefined;

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: theme.palette.background.paper,
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: 50,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 1 }}>
                {/* Logo */}
                <Link href={user ? "/dashboard" : "/"} legacyBehavior passHref>
                    <Box component="a" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '10px',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                        }}>
                            <MenuBookIcon sx={{ fontSize: 22, color: 'white' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
                            NoteUZ
                        </Typography>
                    </Box>
                </Link>

                {/* Search Bar (Desktop) - Ukrywamy jeśli hideSearch=true */}
                {!hideSearch && (
                    <Box sx={{ flex: 1, maxWidth: 500, display: { xs: 'none', md: 'block' }, mx: 4 }}>
                        <Box sx={{
                            position: 'relative',
                            borderRadius: '10px',
                            backgroundColor: theme.palette.mode === 'light' ? alpha('#000', 0.04) : alpha('#fff', 0.08),
                            '&:hover': { backgroundColor: theme.palette.mode === 'light' ? alpha('#000', 0.06) : alpha('#fff', 0.12) },
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
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ThemeToggle />
                    <LanguageSwitcher />

                    {user ? (
                        <>
                            {/* PRZYCISK ADMINA */}
                            {user.isAdmin && (
                                <Tooltip title="Panel Administratora">
                                    <IconButton
                                        component={Link}
                                        href="/admin"
                                        color="primary"
                                        sx={{
                                            border: '1px dashed',
                                            borderColor: theme.palette.primary.main,
                                            mr: 1
                                        }}
                                    >
                                        <AdminPanelSettingsIcon />
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip title={t('my_profile') || "Mój Profil"}>
                                <IconButton
                                    component={Link}
                                    href="/dashboard"
                                    sx={{ p: 0 }}
                                >
                                    <Avatar
                                        src={avatarUrl}
                                        alt={displayName}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: theme.palette.secondary.main,
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem'
                                        }}
                                    >
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
                                sx={{ ml: 1 }}
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
                                sx={{ px: 3 }}
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