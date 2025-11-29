import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { applyTheme, getTheme } from '../lib/theme';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
    // Zastosuj motyw przy załadowaniu aplikacji
    useEffect(() => {
        const theme = getTheme();
        applyTheme(theme);
    }, []);

    return <Component {...pageProps} />;
}

export default appWithTranslation(App);