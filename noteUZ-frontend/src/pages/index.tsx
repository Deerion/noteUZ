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
                <header style={styles.navFull}>
                    <div style={styles.navInner}>
                        <div style={styles.leftGroup}>
                            <button aria-label="menu" style={styles.iconButton}>
                                                        <span
                                                            className="material-symbols-outlined"
                                                            style={{fontSize: 22, color: 'var(--foreground)'}}
                                                        >
                                                          menu
                                                        </span>
                            </button>

                            <div style={styles.brandRow}>
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
                            </div>
                        </div>

                        <div style={styles.centerGroup}>
                            <div style={styles.search}>
                                <input
                                    placeholder={t('searchPlaceholder') || 'Szukaj'}
                                    style={styles.searchInput}
                                />
                            </div>
                        </div>

                        <div style={styles.rightGroup}>
                            <Link href="/login" style={styles.ctaLinkInline}>
                                {t('loginButton')}
                            </Link>
                            <Link href={router.asPath} locale={switchLocale} style={styles.langLink}>
                                {switchLocale.toUpperCase()}
                            </Link>
                        </div>
                    </div>
                </header>

                <div style={styles.container}>
                    <section style={styles.hero}>
                        <div style={styles.heroLeft}>
                            <h2 style={styles.title}>{t('homeTitle')}</h2>
                            <p style={styles.lead}>{t('welcome')}</p>

                            <div style={styles.ctaRow}>
                                <Link href="/login" style={styles.ctaLink}>
                                    {t('loginButton')}
                                </Link>
                                <a href="#features" style={styles.secondary}>
                                    {t('featuresTitle') || 'Cechy'}
                                </a>
                            </div>
                        </div>

                        <aside style={styles.heroRight} aria-hidden>
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
                        </aside>
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
                </div>

                <footer style={styles.footer}>© {new Date().getFullYear()} NoteUZ</footer>
            </main>
        </>
    );
}

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
        flexDirection: 'column',
        gap: 32,
        background: 'var(--background, #ffffff)',
        color: 'var(--foreground, #171717)',
        fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
        padding: 0,
    },
    /* pełna szerokość nagłówka */
    navFull: {
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--background)',
        borderBottom: '1px solid rgba(15,23,42,0.04)',
        backdropFilter: 'blur(6px)',
    },
    /* wewnętrzny kontener: rozsuwa elementy do boków */
    navInner: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 18px', // kontroluj odsunięcie od krawędzi okna
        boxSizing: 'border-box',
    },
    leftGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    centerGroup: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 12px',
    },
    rightGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
    },
    iconButton: {
        background: 'transparent',
        border: 'none',
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
    },
    search: {
        width: '100%',
        maxWidth: 760,
    },
    searchInput: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 12,
        border: '1px solid rgba(15,23,42,0.06)',
        background: 'var(--background)',
        boxShadow: '0 6px 16px rgba(2,6,23,0.04)',
        outline: 'none',
    },

    container: {
        width: 'min(92%, 1100px)',
        margin: '24px auto',
        boxSizing: 'border-box',
    },

    brandRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 44,
        height: 44,
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
        color: 'var(--foreground, #0f172a)',
    },

    hero: {
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: 28,
        borderRadius: 12,
        background: 'linear-gradient(180deg, #fbfdff 0%, #eef6ff 100%)',
        boxShadow: '0 8px 30px rgba(2,6,23,0.04)',
    },
    heroLeft: {
        flex: 1,
        minWidth: 260,
    },
    heroRight: {
        width: 320,
        minWidth: 220,
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
        padding: '12px 18px',
        borderRadius: 10,
        background: '#ff7a18',
        color: 'white',
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: '0 8px 22px rgba(255,122,24,0.16)',
    },
    ctaLinkInline: {
        display: 'inline-block',
        padding: '8px 12px',
        borderRadius: 10,
        background: '#ff7a18',
        color: 'white',
        fontWeight: 600,
        textDecoration: 'none',
    },
    langLink: {
        padding: '8px 10px',
        borderRadius: 10,
        background: 'transparent',
        color: '#334155',
        textDecoration: 'none',
        border: '1px solid rgba(15,23,42,0.06)',
    },

    title: {
        margin: 0,
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--foreground, #0f172a)',
    },
    lead: {
        marginTop: 10,
        color: '#334155',
        fontSize: 16,
        maxWidth: 640,
        lineHeight: 1.6,
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
        paddingTop: 6,
    },
    featuresTitle: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--foreground, #0f172a)',
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
        padding: 16,
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
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
        padding: '18px 0',
    },
};