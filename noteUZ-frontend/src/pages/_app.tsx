import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { applyTheme, getTheme } from '../lib/theme';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        const theme = getTheme();
        applyTheme(theme);
    }, []);

    return (
        <>
            <Head> 
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" /> 
                <title>NoteUZ</title> 
            </Head> 
            <Component {...pageProps} />
        </> 
    );
}

export default appWithTranslation(App);