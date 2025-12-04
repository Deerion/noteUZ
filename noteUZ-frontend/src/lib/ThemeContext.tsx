// src/lib/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider, CssBaseline, PaletteMode } from '@mui/material';
import { getAppTheme } from '../theme'; // Import Twojego konfiguratora motywu
import { getTheme, setTheme as setLocalStorageTheme, applyTheme, watchSystemTheme, ThemeMode } from './theme';

interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<PaletteMode>('light');

    // Funkcja przełączająca motyw
    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            setLocalStorageTheme(newMode); // Zapisz w localStorage
            return newMode;
        });
    };

    // Inicjalizacja przy starcie
    useEffect(() => {
        const storedTheme = getTheme();

        // Ustalenie początkowego stanu
        let initialMode: PaletteMode = 'light';
        if (storedTheme === 'system') {
            initialMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            initialMode = storedTheme as PaletteMode;
        }

        setMode(initialMode);
        applyTheme(storedTheme); // Aplikuje atrybut data-theme

        // Obsługa zmian systemowych (jeśli wybrano 'system')
        if (storedTheme === 'system') {
            const unwatch = watchSystemTheme((isDark) => {
                setMode(isDark ? 'dark' : 'light');
            });
            return unwatch;
        }
    }, []);

    // Generowanie motywu MUI
    const muiTheme = useMemo(() => getAppTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}