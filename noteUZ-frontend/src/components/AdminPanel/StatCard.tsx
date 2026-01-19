import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorType: 'primary' | 'secondary' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorType }) => {
    const theme = useTheme();
    const color = theme.palette[colorType].main;

    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{
                position: 'absolute', right: -15, top: -15,
                opacity: 0.1, fontSize: 100, color: color,
                transform: 'rotate(-10deg)'
            }}>
                {icon}
            </Box>
            <CardContent>
                <Typography color="text.secondary" variant="overline" fontWeight="bold" letterSpacing={1}>
                    {title}
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ color: color, mt: 1 }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};