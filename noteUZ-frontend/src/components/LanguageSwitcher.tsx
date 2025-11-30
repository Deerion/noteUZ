import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LanguageSwitcher() {
    const router = useRouter();
    const { pathname, asPath, query, locale } = router;

    const nextLocale = locale === 'pl' ? 'en' : 'pl';
    const label = locale === 'pl' ? 'PL' : 'EN';

    return (
        <Link
            href={{ pathname, query }}
            as={asPath}
            locale={nextLocale}
            className="theme-toggle"
            style={{
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title={locale === 'pl' ? 'Switch to English' : 'Zmień na Polski'}
        >
            {label}
        </Link>
    );
}