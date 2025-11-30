import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { Toaster } from 'react-hot-toast';
import { applyTheme, getTheme } from '../lib/theme';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
    // Zastosuj motyw przy załadowaniu aplikacji
    useEffect(() => {
        const theme = getTheme();
        applyTheme(theme);
    }, []);

    return (
        <>
            <Component {...pageProps} />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'var(--card-bg)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                    },
                }}
            />
        </>
    );
}

export default appWithTranslation(App);