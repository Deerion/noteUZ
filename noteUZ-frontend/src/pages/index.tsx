import Head from 'next/head';
import Link from 'next/link';
import {GetStaticProps} from 'next';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import React from 'react';

export default function Home() {
    const t = useTranslations('Home');
    const router = useRouter();
    const {locale} = router;
    const switchLocale = locale === 'pl' ? 'en' : 'pl';

    return (
        <>
            <Head>
                <title>NoteUZ — {t('homeTitle')}</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                />
            </Head>

            <main style={styles.page}>
                <div style={styles.card}>
                    <header style={styles.header}>
                        <div style={styles.logo} aria-hidden>
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{fontSize: 26, color: 'white', lineHeight: 1}}
                                                    aria-hidden
                                                >
                                                    menu_book
                                                </span>
                        </div>
                        <h1 style={styles.brandTitle}>NoteUZ</h1>

                        <nav style={{marginLeft: 'auto', display: 'flex', gap: 8}}>
                            <Link
                                href={router.asPath}
                                locale={switchLocale}
                                style={styles.headerLocaleLink}
                            >
                                {switchLocale.toUpperCase()}
                            </Link>
                        </nav>
                    </header>

                    <section style={styles.hero}>
                        <div style={styles.heroLeft}>
                            <h2 style={styles.title}>{t('homeTitle')}</h2>
                            <p style={styles.lead}>{t('welcome')}</p>

                            <div style={styles.ctaRow}>
                                <Link href="/login" style={styles.ctaLink}>
                                    {t('loginButton')}
                                </Link>
                            </div>
                        </div>

                        <div style={styles.heroRight} aria-hidden>
                            <div style={styles.device}>
                                <div style={styles.deviceHeader}/>
                                <div style={styles.deviceBody}>
                                    <div style={styles.noteMock}>
                                        <div style={styles.noteLine}/>
                                        <div style={{...styles.noteLine, width: '80%'}}/>
                                        <div style={{...styles.noteLine, width: '60%'}}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="features" style={styles.features}>
                        <h3 style={styles.featuresTitle}>{t('featuresTitle') || 'Cechy'}</h3>
                        <div style={styles.featuresGrid}>
                            <div style={styles.feature}>
                                <div style={styles.featureIcon}>✦</div>
                                <h4 style={styles.featureTitle}>{t('feature1Title') || 'Proste notatki'}</h4>
                                <p style={styles.featureText}>
                                    {t('feature1Text') || 'Twórz, edytuj i zarządzaj notatkami szybko i bez komplikacji.'}
                                </p>
                            </div>

                            <div style={styles.feature}>
                                <div style={styles.featureIcon}>⚡</div>
                                <h4 style={styles.featureTitle}>{t('feature2Title') || 'Szybkie'}</h4>
                                <p style={styles.featureText}>
                                    {t('feature2Text') || 'Lekki interfejs, szybkie ładowanie i płynne działanie.'}
                                </p>
                            </div>

                            <div style={styles.feature}>
                                <div style={styles.featureIcon}>🔒</div>
                                <h4 style={styles.featureTitle}>{t('feature3Title') || 'Bezpieczeństwo'}</h4>
                                <p style={styles.featureText}>
                                    {t('feature3Text') || 'Twoje notatki pozostają prywatne — kontrolujesz dostęp.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <footer style={styles.footer}>© {new Date().getFullYear()} NoteUZ</footer>
                </div>
            </main>
        </>
    );
}

// ładowanie tłumaczeń (niezmienione)
export const getStaticProps: GetStaticProps = async ({locale}) => ({
    props: {
        messages: (await import(`../messages/${locale}.json`)).default,
        locale,
    },
});

const styles: { [k: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
        background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)',
        color: 'var(--foreground, #0f172a)',
    },
    card: {
        width: '100%',
        maxWidth: 1100,
        padding: 28,
        boxSizing: 'border-box',
        borderRadius: 14,
        background: 'white',
        boxShadow: '0 12px 40px rgba(2,6,23,0.06)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(79,70,229,0.12)',
        flexShrink: 0,
    },
    brandTitle: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: '#0f172a',
    },
    headerLocaleLink: {
        padding: '8px 10px',
        borderRadius: 10,
        background: 'transparent',
        color: '#334155',
        textDecoration: 'none',
        border: '1px solid rgba(15,23,42,0.06)',
    },
    hero: {
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    heroLeft: {
        flex: 1,
        minWidth: 280,
    },
    title: {
        margin: 0,
        fontSize: 28,
        fontWeight: 700,
        color: '#0f172a',
    },
    lead: {
        marginTop: 10,
        color: '#334155',
        fontSize: 15,
        maxWidth: 560,
        lineHeight: 1.5,
    },
    ctaRow: {
        marginTop: 18,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    ctaLink: {
        display: 'inline-block',
        padding: '10px 16px',
        borderRadius: 10,
        background: '#ff7a18',
        color: 'white',
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: '0 8px 22px rgba(255,122,24,0.16)',
    },
    secondary: {
        display: 'inline-block',
        padding: '10px 14px',
        borderRadius: 10,
        background: 'transparent',
        color: '#334155',
        textDecoration: 'none',
        border: '1px solid rgba(15,23,42,0.06)',
    },
    heroRight: {
        width: 300,
        minWidth: 240,
    },
    device: {
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(2,6,23,0.06)',
        border: '1px solid #eef6ff',
        background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
    },
    deviceHeader: {
        height: 10,
        background: 'linear-gradient(90deg, #06b6d4, #4f46e5)',
    },
    deviceBody: {
        padding: 18,
    },
    noteMock: {
        background: '#fbfdff',
        borderRadius: 8,
        padding: 12,
    },
    noteLine: {
        height: 10,
        background: 'linear-gradient(90deg, rgba(79,70,229,0.12), rgba(6,182,212,0.06))',
        borderRadius: 6,
        marginBottom: 8,
    },
    features: {
        marginTop: 22,
        paddingTop: 14,
    },
    featuresTitle: {
        margin: 0,
        fontSize: 16,
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: 12,
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
    },
    feature: {
        background: 'white',
        borderRadius: 10,
        padding: 14,
        boxShadow: '0 8px 22px rgba(2,6,23,0.04)',
    },
    featureIcon: {
        fontSize: 20,
        marginBottom: 8,
    },
    featureTitle: {
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
    },
    featureText: {
        marginTop: 6,
        color: '#475569',
        fontSize: 13,
        lineHeight: 1.4,
    },
    footer: {
        marginTop: 18,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
    },
};