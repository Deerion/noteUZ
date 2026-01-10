import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
    Box,
    Typography,
    Button,
    useTheme,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    alpha,
    Paper,
    CircularProgress
} from '@mui/material';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';

import { Navbar } from '@/components/landing/Navbar';
import { UserData } from '@/types/User';
import { apiFetch } from '@/lib/api';

interface NotesLayoutProps {
    children: React.ReactNode;
    title: string;
    actionButton?: React.ReactNode;
}

export const NotesLayout: React.FC<NotesLayoutProps> = ({ children, title, actionButton }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [busy, setBusy] = useState(false);

    const isActive = (path: string) => router.pathname === path;

    useEffect(() => {
        apiFetch<UserData>('/api/auth/me')
            .then(data => setUser(data))
            .catch(() => { })
            .finally(() => setLoadingUser(false));
    }, []);

    const handleLogout = async () => {
        setBusy(true);
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } finally {
            setBusy(false);
        }
    };

    const menuItems = [
        { text: t('my_notes'), icon: <DescriptionOutlinedIcon />, path: '/notes', disabled: false },
        { text: t('groups_nav'), icon: <PeopleOutlineIcon />, path: '/groups', disabled: false },
        { text: t('shared_notes'), icon: <ShareIcon />, path: '/notes/shared', disabled: false }
    ];

    if (loadingUser) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--page-gradient)' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'var(--page-gradient)',
        }}>
            <Navbar user={user} onLogout={handleLogout} busy={busy} />

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ================= SIDEBAR (Flat & Tonal) ================= */}
                <Paper
                    elevation={0}
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        // Usuwamy cień, dodajemy subtelną linię
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'transparent', // Przezroczyste tło, żeby zlało się ze stroną
                        pt: 3,
                        px: 2
                    }}
                >
                    <List>
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link href={item.disabled ? '#' : item.path} key={item.path} legacyBehavior passHref>
                                    <ListItemButton
                                        component="a"
                                        disabled={item.disabled}
                                        selected={active}
                                        sx={{
                                            borderRadius: '50px', // Pastylka
                                            mb: 1,
                                            pl: 2.5,
                                            // Tonal State: Wypełnienie kolorem (bez cienia) gdy aktywne
                                            '&.Mui-selected': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1), // Lekki pomarańcz
                                                color: theme.palette.primary.main, // Ciemny pomarańcz tekst
                                                fontWeight: 700,
                                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) },
                                                '& .MuiListItemIcon-root': { color: theme.palette.primary.main }
                                            },
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.text.primary, 0.05) // Szary hover
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 42, color: active ? 'inherit' : 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: active ? 700 : 500,
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </ListItemButton>
                                </Link>
                            );
                        })}
                    </List>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ p: 2, pb: 4 }}>
                        <Divider sx={{ mb: 2, mx: 1 }} />
                        <Link href="/dashboard" legacyBehavior passHref>
                            <ListItemButton
                                component="a"
                                sx={{ borderRadius: '50px', color: 'text.secondary', pl: 2.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 42 }}>
                                    <ArrowBackIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('back_to_dashboard')} />
                            </ListItemButton>
                        </Link>
                    </Box>
                </Paper>

                {/* MAIN CONTENT */}
                <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4, lg: 5 }, overflowY: 'auto' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 4
                    }}>
                        <Box>
                            <Box sx={{ display: { md: 'none' }, mb: 2 }}>
                                <Link href="/dashboard" legacyBehavior>
                                    <Button startIcon={<ArrowBackIcon />} size="small" color="inherit" sx={{ borderRadius: '50px' }}>
                                        {t('dashboard')}
                                    </Button>
                                </Link>
                            </Box>
                            <Typography variant="h4" component="h1" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                                {title}
                            </Typography>
                        </Box>
                        {actionButton && <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{actionButton}</Box>}
                    </Box>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};