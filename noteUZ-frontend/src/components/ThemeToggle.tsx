import { useEffect, useState } from 'react';
import { getTheme, setTheme, applyTheme, watchSystemTheme, getEffectiveTheme, type ThemeMode } from '../lib/theme';

export default function ThemeToggle() {
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    // Inicjalizacja przy montowaniu komponentu
    useEffect(() => {
        const current = getTheme();
        setThemeState(current);
        setEffectiveTheme(getEffectiveTheme());

        // Jeśli system, nasłuchuj zmian
        if (current === 'system') {
            const unwatch = watchSystemTheme(() => {
                setEffectiveTheme(getEffectiveTheme());
            });
            return unwatch;
        }
    }, []);

    // Obsługi zmiany motywu
    const handleToggle = () => {
        const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setThemeState(newTheme);
        setEffectiveTheme(getEffectiveTheme());
    };

    return (
        <button
            onClick={handleToggle}
            className="theme-toggle"
            title={`Przełącz na motyw ${effectiveTheme === 'light' ? 'ciemny' : 'jasny'}`}
            aria-label={`Motyw: ${effectiveTheme}`}
        >
            {effectiveTheme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/* Moon icon */}
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/* Sun icon */}
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            )}
        </button>
    );
}