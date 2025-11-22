// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { applyTheme, getTheme } from '../lib/theme';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    // Zastosuj motyw przy załadowaniu aplikacji
    useEffect(() => {
        const theme = getTheme();
        applyTheme(theme);
    }, []);

    return <Component {...pageProps} />;
}
