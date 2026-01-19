import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

export const FeatureCard = ({ icon, title, desc }: FeatureCardProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: '16px',
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 10px 30px -10px ${alpha(theme.palette.primary.main, 0.2)}`
                }
            }}
        >
            <CardContent>
                <Box sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 2
                }}>
                    {icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {desc}
                </Typography>
            </CardContent>
        </Card>
    );
};