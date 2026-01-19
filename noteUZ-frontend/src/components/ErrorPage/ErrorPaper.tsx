// src/components/ErrorPage/ErrorPaper.tsx
import { Paper } from '@mui/material';
import React from 'react';

type ErrorPaperProps = {
    children: React.ReactNode;
};

export const ErrorPaper: React.FC<ErrorPaperProps> = ({ children }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                width: '100%',
                maxWidth: 560,
                padding: 3,
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
            }}
        >
            {children}
        </Paper>
    );
};