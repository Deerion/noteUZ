// src/pages/error.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { AnchorHTMLAttributes } from 'react'; // <-- DODANO AnchorHTMLAttributes

// Importy MUI
import { Box, Paper, Typography, Button as MuiButton, ButtonProps } from '@mui/material';

const titles: Record<string, string> = {
    '401': 'Brak uprawnień',
    '403': 'Dostęp zabroniony',
    '404': 'Nie znaleziono',
    '500': 'Błąd serwera',
    '503': 'Serwis niedostępny',
};

const PURPLE_ACCENT = '#4f46e5';

// Poprawiony komponent do poprawnej integracji next/link z MUI (fix TS2322)
type NextLinkProps = {
    href: string;
} & Omit<ButtonProps, 'href' | 'component'> & AnchorHTMLAttributes<HTMLAnchorElement>;

const NextLink = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
    function NextLink({ href, children, ...other }, ref) {
        return (
            <Link href={href} legacyBehavior passHref>
                <a ref={ref} {...other}>
                    {children}
                </a>
            </Link>
        );
    }
);

export default function ErrorPage() {
    const { query, push } = useRouter();
    const code = (query.code as string) ?? '500';
    const msg = (query.msg as string) ?? 'Wystąpił błąd';
    const title = titles[code] ?? 'Błąd';

    return (
        <>
            <Head>
                <title>{title} — {code}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)', // Stałe tło
                    padding: 3,
                    fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
                }}
            >
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
                    <Typography variant="h5" component="h1" fontWeight={700}>
                        {title} ({code})
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: 1.5, color: '#334155' }}>
                        {msg}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5, marginTop: 2, flexWrap: 'wrap' }}>
                        {code === '401' && (
                            <MuiButton
                                component={NextLink}
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
                            </MuiButton>
                        )}

                        {code === '503' && (
                            <MuiButton
                                onClick={() => push('/login')}
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

                        <MuiButton
                            component={NextLink}
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
                        </MuiButton>
                    </Box>
                </Paper>
            </Box>
        </>
    );
}