import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import s from '../styles/Home.module.css';

export default function Home() {
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
                                <input placeholder="Szukaj" className={s.searchInput}/>
                            </div>
                        </div>

                        <div className={s.rightGroup}>
                            <Link href="/login" className={s.ctaLinkInline}>
                                Zaloguj
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={s.container}>
                    <section className={s.hero}>
                        <div className={s.heroLeft}>
                            <h2 className={s.title}>Witaj w NoteUZ</h2>
                            <p className={s.lead}>Twórz i zarządzaj notatkami szybko i bez komplikacji.</p>

                            <div className={s.ctaRow}>
                                <Link href="/login" className={s.ctaLink}>
                                    Zaloguj
                                </Link>
                                <a href="#features" className={s.secondary}>
                                    Cechy
                                </a>
                            </div>
                        </div>

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
                        <h3 className={s.featuresTitle}>Cechy</h3>
                        <div className={s.featuresGrid}>
                            <div className={s.feature}>
                                <div className={s.featureIcon}>✦</div>
                                <h4 className={s.featureTitle}>Proste notatki</h4>
                                <p className={s.featureText}>
                                    Twórz, edytuj i zarządzaj notatkami szybko i bez komplikacji.
                                </p>
                            </div>

                            <div className={s.feature}>
                                <div className={s.featureIcon}>⚡</div>
                                <h4 className={s.featureTitle}>Szybkość</h4>
                                <p className={s.featureText}>
                                    Lekki interfejs, szybkie ładowanie i płynne działanie.
                                </p>
                            </div>

                            <div className={s.feature}>
                                <div className={s.featureIcon}>🔒</div>
                                <h4 className={s.featureTitle}>Bezpieczeństwo</h4>
                                <p className={s.featureText}>
                                    Twoje notatki pozostają prywatne — kontrolujesz dostęp.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className={s.footer}>© {new Date().getFullYear()} NoteUZ</footer>
            </main>
        </>
    );
}
