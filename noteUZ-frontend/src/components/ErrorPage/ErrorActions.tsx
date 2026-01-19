// src/components/ErrorPage/ErrorActions.tsx
import { useRouter } from 'next/router';
import { Box, Button as MuiButton } from '@mui/material';
import React from 'react';
import { NextLinkButton } from './NextLinkButton'; // Import istniejącego komponentu

type ErrorActionsProps = {
    code: string;
};

const PURPLE_ACCENT = '#4f46e5';

export const ErrorActions: React.FC<ErrorActionsProps> = ({ code }) => {
    const { push } = useRouter();

    return (
        <Box sx={{ display: 'flex', gap: 1.5, marginTop: 2, flexWrap: 'wrap' }}>
            {/* 1. Przycisk Zaloguj się (tylko dla 401) */}
            {code === '401' && (
                <NextLinkButton
                    href="/login"
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#1e293b',
                        backgroundColor: '#eef2ff',
                        borderColor: '#c7d2fe',
                        '&:hover': {
                            backgroundColor: '#eef2ff',
                            borderColor: '#c7d2fe',
                        }
                    }}
                >
                    Zaloguj się
                </NextLinkButton>
            )}

            {/* 2. Przycisk Spróbuj ponownie (tylko dla 503) */}
            {code === '503' && (
                <MuiButton
                    onClick={() => push('/login')} // W oryginalnym kodzie 503 prowadziło do /login, zakładamy, że to jest zamierzony "reload" lub próba.
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Spróbuj ponownie
                </MuiButton>
            )}

            {/* 3. Przycisk Strona główna (zawsze widoczny) */}
            <NextLinkButton
                href="/"
                variant="outlined"
                sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                        backgroundColor: 'background.paper',
                        borderColor: PURPLE_ACCENT,
                        color: PURPLE_ACCENT,
                    }
                }}
            >
                Strona główna
            </NextLinkButton>
        </Box>
    );
};