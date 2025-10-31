// pages/index.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';

export default function Home() {
    const t = useTranslations('Home');
    const router = useRouter();

    const { locale } = router;
    const switchLocale = locale === 'pl' ? 'en' : 'pl';

    return (
        <main style={{ padding: 24 }}>
            <h1>{t('homeTitle')}</h1>
            <p>{t('welcome')}</p>

            <Link href="/login">
                <button>{t('loginButton')}</button>
            </Link>

            <div style={{ marginTop: 20 }}>
                <Link href={router.asPath} locale={switchLocale}>
                    <button>
                        {t('changeLanguage')} {switchLocale.toUpperCase()}
                    </button>
                </Link>
            </div>
        </main>
    );
}
//ładowanie tłumaczeń
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        messages: (await import(`../messages/${locale}.json`)).default,
        locale
    }
});
