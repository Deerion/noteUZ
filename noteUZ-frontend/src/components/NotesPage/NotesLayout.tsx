// src/components/NotesPage/NotesLayout.tsx
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

// Ikony
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

    // Stan użytkownika dla Navbara
    const [user, setUser] = useState<UserData | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [busy, setBusy] = useState(false);

    const isActive = (path: string) => router.pathname === path;

    // Pobieranie użytkownika (aby Navbar działał poprawnie)
    useEffect(() => {
        apiFetch<UserData>('/api/auth/me')
            .then(data => setUser(data))
            .catch(() => {
                // Opcjonalnie: przekierowanie, jeśli sesja wygasła
                // router.push('/login'); 
            })
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
        {
            text: t('my_notes'),
            icon: <DescriptionOutlinedIcon />,
            path: '/notes',
            disabled: false
        },
        {
            text: t('groups_nav'),
            icon: <PeopleOutlineIcon />,
            path: '/groups',
            disabled: false
        },
        {
            text: t('shared_notes'),
            icon: <ShareIcon />,
            path: '/notes/shared',
            disabled: false
        }
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
            flexDirection: 'column', // ZMIANA: Układ kolumnowy (Navbar na górze)
            minHeight: '100vh',
            background: 'var(--page-gradient)',
        }}>
            {/* 1. NAVBAR NA GÓRZE */}
            <Navbar
                user={user}
                onLogout={handleLogout}
                busy={busy}
                // hideSearch={false} // Możesz włączyć wyszukiwarkę jeśli chcesz globalnego szukania
            />

            {/* 2. KONTENER TREŚCI (Sidebar + Main) */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ================= LEWY SIDEBAR ================= */}
                <Paper
                    elevation={0}
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        // Tło lekko przezroczyste, pasujące do motywu
                        backgroundColor: theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.5)'
                            : 'rgba(20, 20, 20, 0.5)',
                        backdropFilter: 'blur(10px)',
                        pt: 2 // Padding od góry
                    }}
                >
                    {/* Usunąłem logo "NoteUZ" stąd, bo jest już w Navbarze wyżej */}

                    {/* Lista Menu */}
                    <List sx={{ px: 2 }}>
                        {menuItems.map((item) => (
                            <Link href={item.disabled ? '#' : item.path} key={item.path} legacyBehavior passHref>
                                <ListItemButton
                                    component="a"
                                    disabled={item.disabled}
                                    selected={isActive(item.path)}
                                    sx={{
                                        borderRadius: '10px',
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) },
                                            '& .MuiListItemIcon-root': { color: theme.palette.primary.main }
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{ minWidth: 40, color: isActive(item.path) ? 'inherit' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive(item.path) ? 600 : 500,
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </ListItemButton>
                            </Link>
                        ))}
                    </List>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Sekcja dolna Sidebara */}
                    <Box sx={{ p: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Link href="/dashboard" legacyBehavior passHref>
                            <ListItemButton
                                component="a"
                                sx={{ borderRadius: '10px', color: 'text.secondary' }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <ArrowBackIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('back_to_dashboard')} />
                            </ListItemButton>
                        </Link>
                    </Box>
                </Paper>

                {/* ================= GŁÓWNA TREŚĆ ================= */}
                <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4, lg: 6 }, overflowY: 'auto' }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 5
                    }}>
                        <Box>
                            {/* Mobilny przycisk powrotu */}
                            <Box sx={{ display: { md: 'none' }, mb: 2 }}>
                                <Link href="/dashboard" legacyBehavior>
                                    <Button startIcon={<ArrowBackIcon />} size="small" color="inherit">
                                        {t('dashboard')}
                                    </Button>
                                </Link>
                            </Box>

                            <Typography variant="h4" component="h1" fontWeight={800}>
                                {title}
                            </Typography>
                        </Box>

                        {actionButton && (
                            <Box>
                                {actionButton}
                            </Box>
                        )}
                    </Box>

                    {children}
                </Box>
            </Box>
        </Box>
    );
};