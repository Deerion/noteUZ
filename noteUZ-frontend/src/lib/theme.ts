// lib/theme.ts
export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';

export function getTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'system';

    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored;
    }
    return 'system';
}

export function setTheme(theme: ThemeMode): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
}

export function applyTheme(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }
}

export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
        callback(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
}

export function getEffectiveTheme(): 'light' | 'dark' {
    const theme = getTheme();
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';

    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
}
