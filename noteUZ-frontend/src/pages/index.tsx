import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next'; 
import { useTranslation } from 'next-i18next'; 
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'; 
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher'; 
import s from '../styles/Home.module.css';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Home() {
    const { t } = useTranslation('common'); 
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [busy, setBusy] = useState(false);
    
    async function refreshSession() {
        try {
            const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
            setIsLoggedIn(res.ok);
            return res.ok;
        } catch {
            setIsLoggedIn(false);
            return false;
        }
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            const ok = await refreshSession();
            if (!mounted) return;
        })();
        return () => { mounted = false; };
    }, []);

    async function onLogout() {
        setBusy(true);
        try {
            await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
            const ok = await refreshSession();
            if (!ok) {
                setIsLoggedIn(false);
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Head>
                <title>NoteUZ — Home</title>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"/>
            </Head>

            <main className={s.page}>
                <header className={s.navFull}>
                    <div className={s.navInner}>
                        <div className={s.leftGroup}>
                            <button aria-label="menu" className={s.iconButton}>
                                <span className="material-symbols-outlined" style={{fontSize: 22, color: 'var(--foreground)'}}>menu</span>
                            </button>
                            <div className={s.brandRow}>
                                <div className={s.logo} aria-hidden>
                                    <span className="material-symbols-outlined" style={{fontSize: 26, color: 'white', lineHeight: 1}} aria-hidden>
                                        menu_book
                                    </span>
                                </div>
                                <h1 className={s.brandTitle}>NoteUZ</h1>
                            </div>
                        </div>

                        <div className={s.centerGroup}>
                            <div className={s.search}>
                                <input placeholder={t('search')} className={s.searchInput}/> 
                            </div>
                        </div>

                        <div className={s.rightGroup}>
                            <LanguageSwitcher /> 
                            <ThemeToggle />
                            {isLoggedIn ? (
                                <button className={s.ctaLinkInline} onClick={onLogout} disabled={busy}>
                                    {busy ? '...' : t('logout')} 
                                </button>
                            ) : (
                                <>
                                    <Link href="/register" className={s.ctaLinkInline}>
                                        {t('register')} 
                                    </Link>
                                    <Link href="/login" className={s.ctaLinkInline}>
                                        {t('login')} 
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className={s.container}>
                    <section className={s.hero}>
                        <div className={s.heroLeft}>
                            <h2 className={s.title}>{t('welcome')}</h2> 
                            <p className={s.lead}>{t('description')}</p> 

                            <div className={s.ctaRow}>
                                {isLoggedIn ? (
                                    <Link href="/notes" className={s.ctaLink}>{t('notes')}</Link>
                                ) : (
                                    <Link href="/register" className={s.ctaLink}>{t('register')}</Link>
                                )}
                                <a href="#features" className={s.secondary}>{t('features')}</a>
                            </div>
                        </div>
                        <button onClick={async () => {
                            const r = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
                            alert('ME status: ' + r.status);
                        }} style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--card-bg)',
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}>
                            Sprawdź sesję
                        </button>

                        <aside className={s.heroRight} aria-hidden>
                            <div className={s.device}>
                                <div className={s.deviceHeader}/>
                                <div className={s.deviceBody}>
                                    <div className={s.noteMock}>
                                        <div className={s.noteLine}/>
                                        <div className={`${s.noteLine} ${s.noteLineWide80}`}/>
                                        <div className={`${s.noteLine} ${s.noteLineWide60}`}/>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>
                    
                    <section id="features" className={s.features}>
                        <h3 className={s.featuresTitle}>{t('features')}</h3>
                        <div className={s.featuresGrid}>
                            <div className={s.feature}>
                                <div className={s.featureIcon}>✦</div>
                                <h4 className={s.featureTitle}>{t('feature_simple_title')}</h4> 
                                <p className={s.featureText}>{t('feature_simple_desc')}</p>     
                            </div>
                            
                            <div className={s.feature}>
                                <div className={s.featureIcon}>⚡</div>
                                <h4 className={s.featureTitle}>{t('feature_speed_title')}</h4>  
                                <p className={s.featureText}>{t('feature_speed_desc')}</p>      
                            </div>

                            <div className={s.feature}>
                                <div className={s.featureIcon}>🔒</div>
                                <h4 className={s.featureTitle}>{t('feature_security_title')}</h4> 
                                <p className={s.featureText}>{t('feature_security_desc')}</p>     
                            </div>
                        </div>
                    </section>
                </div>
                <footer className={s.footer}>© {new Date().getFullYear()} NoteUZ</footer>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'pl', ['common'])),
        },
    };
};