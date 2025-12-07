import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

export const MockInterface = () => {
    const theme = useTheme();

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 500,
            height: 320,
            borderRadius: '20px',
            background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(30,30,30,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'light'
                ? '0 20px 60px -10px rgba(79, 70, 229, 0.15)'
                : '0 20px 60px -10px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px) rotateX(2deg)',
                boxShadow: theme.palette.mode === 'light'
                    ? '0 30px 70px -10px rgba(79, 70, 229, 0.25)'
                    : '0 30px 70px -10px rgba(0,0,0,0.7)',
            }
        }}>
            {/* Header okna */}
            <Box sx={{
                height: 40,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                gap: 1
            }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#febc2e' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28c840' }} />
            </Box>

            {/* Treść okna */}
            <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
                {/* Sidebar */}
                <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[1, 2, 3].map(i => (
                        <Box key={i} sx={{
                            height: 8,
                            width: '80%',
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.text.secondary, 0.15)
                        }} />
                    ))}
                </Box>
                {/* Main Content */}
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ height: 20, width: '60%', borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.15), mb: 2 }} />
                    <Box sx={{ height: 10, width: '100%', borderRadius: 4, bgcolor: alpha(theme.palette.text.secondary, 0.08), mb: 1 }} />
                    <Box sx={{ height: 10, width: '90%', borderRadius: 4, bgcolor: alpha(theme.palette.text.secondary, 0.08), mb: 1 }} />
                    <Box sx={{ height: 10, width: '95%', borderRadius: 4, bgcolor: alpha(theme.palette.text.secondary, 0.08), mb: 1 }} />

                    {/* Floating Card inside */}
                    <Box sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2)
                    }}>
                        <Box sx={{ height: 10, width: '40%', borderRadius: 4, bgcolor: theme.palette.primary.main, mb: 1, opacity: 0.3 }} />
                        <Box sx={{ height: 8, width: '70%', borderRadius: 4, bgcolor: theme.palette.text.primary, opacity: 0.1 }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};