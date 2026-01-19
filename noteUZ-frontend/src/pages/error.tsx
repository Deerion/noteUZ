// src/pages/error.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

// Importy MUI
import { Typography } from '@mui/material';

// Importy Komponentów
import { ErrorLayout } from '@/components/ErrorPage/ErrorLayout';
import { ErrorPaper } from '@/components/ErrorPage/ErrorPaper';
import { ErrorActions } from '@/components/ErrorPage/ErrorActions'; // NOWY IMPORT

const titles: Record<string, string> = {
    '401': 'Brak uprawnień',
    '403': 'Dostęp zabroniony',
    '404': 'Nie znaleziono',
    '500': 'Błąd serwera',
    '503': 'Serwis niedostępny',
};

export default function ErrorPage() {
    const { query } = useRouter(); // push nie jest już potrzebny bezpośrednio
    const code = (query.code as string) ?? '500';
    const msg = (query.msg as string) ?? 'Wystąpił błąd';
    const title = titles[code] ?? 'Błąd';

    return (
        <>
            <Head>
                <title>{title} — {code}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
            </Head>

            <ErrorLayout>
                <ErrorPaper>
                    {/* Sekcja nagłówka i wiadomości */}
                    <Typography variant="h5" component="h1" fontWeight={700}>
                        {title} ({code})
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: 1.5, color: '#334155' }}>
                        {msg}
                    </Typography>

                    {/* Sekcja akcji (przycisków) - wydzielona do osobnego komponentu */}
                    <ErrorActions code={code} />
                </ErrorPaper>
            </ErrorLayout>
        </>
    );
}