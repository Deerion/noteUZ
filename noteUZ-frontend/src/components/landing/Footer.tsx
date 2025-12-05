import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export const Footer = () => {
    const theme = useTheme();

    return (
        <Box component="footer" sx={{
            py: 4,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: theme.palette.mode === 'light'
                ? 'rgba(249, 249, 249, 0.5)'
                : 'rgba(26, 26, 26, 0.5)',
            textAlign: 'center'
        }}>
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} NoteUZ. Designed for efficiency.
            </Typography>
        </Box>
    );
};