// src/components/Dashboard/InfoItem.tsx
import React from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};