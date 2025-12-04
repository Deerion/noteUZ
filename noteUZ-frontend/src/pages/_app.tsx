// src/pages/_app.tsx
import '../styles/globals.css'; // <--- DODAJ TĘ LINIJKĘ NA SAMEJ GÓRZE
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { ThemeContextProvider } from '../lib/ThemeContext';

function App({ Component, pageProps }: AppProps) {
    return (
        <ThemeContextProvider>
            <Component {...pageProps} />
        </ThemeContextProvider>
    );
}

export default appWithTranslation(App);