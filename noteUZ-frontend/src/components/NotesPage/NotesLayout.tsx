// src/components/NotesPage/NotesLayout.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Box, Typography, Button, useTheme, List, ListItemButton, ListItemIcon, ListItemText, Divider, alpha, Paper } from '@mui/material';

// Ikony
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface NotesLayoutProps {
    children: React.ReactNode;
    title: string;
    actionButton?: React.ReactNode;
}

export const NotesLayout: React.FC<NotesLayoutProps> = ({ children, title, actionButton }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const isActive = (path: string) => router.pathname === path;

    const menuItems = [
        {
            text: t('my_notes'),
            icon: <DescriptionOutlinedIcon />,
            path: '/notes',
            disabled: false
        },
        // POPRAWKA: Usunięto "|| 'Grupy'", teraz nazwa pochodzi w 100% z JSON-a
        {
            text: t('groups_nav'),
            icon: <PeopleOutlineIcon />,
            path: '/groups',
            disabled: false
        },
        {
            text: t('shared_notes_soon'),
            icon: <PeopleOutlineIcon />,
            path: '/notes/shared',
            disabled: true
        }
    ];

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--page-gradient)',
        }}>
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
                    backgroundColor: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.5)'
                        : 'rgba(20, 20, 20, 0.5)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                {/* Nagłówek Sidebara */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(79,70,229,0.2)'
                    }}>
                        <MenuBookIcon sx={{ fontSize: 18, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
                        NoteUZ
                    </Typography>
                </Box>

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
                                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'inherit' : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 500, fontSize: '0.95rem' }}
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
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4, lg: 6 }, overflowX: 'hidden' }}>
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
    );
};