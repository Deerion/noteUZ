import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';

export default function MyApp({ Component, pageProps }: AppProps) {
    const { messages, locale } = pageProps;

    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <Component {...pageProps} />
        </NextIntlClientProvider>
    );
}
