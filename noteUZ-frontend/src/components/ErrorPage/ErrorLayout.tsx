// src/components/ErrorPage/ErrorLayout.tsx
import { Box } from '@mui/material';
import React from 'react';

type ErrorLayoutProps = {
    children: React.ReactNode;
};

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({ children }) => {
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)',
                padding: 3,
                fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
            }}
        >
            {children}
        </Box>
    );
};