// src/theme/index.ts
import { createTheme, PaletteMode } from '@mui/material/styles';

const ORANGE_CTA = '#ff7a18';
const PURPLE_ACCENT = '#4f46e5';

export const getAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            main: ORANGE_CTA,
            contrastText: '#fff',
        },
        secondary: {
            main: PURPLE_ACCENT,
        },
        background: {
            // Zostawiamy zmienne dla tła (to kluczowe dla braku błyskania)
            // UWAGA: Jeśli nadal będziesz miał błędy, zamień to na:
            // default: mode === 'light' ? '#ffffff' : '#0a0a0a',
            default: 'var(--background)',
            paper: 'var(--paper)',
        },
        text: {
            // TU BYŁ BŁĄD: MUI musi znać konkretny kolor tekstu do obliczania alpha (np. placeholdery)
            // Wracamy do wartości HEX.
            primary: mode === 'light' ? '#171717' : '#ededed',
            secondary: mode === 'light' ? '#666666' : '#999999',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: 'var(--background)',
                    // Wymuszamy kolor tekstu na poziomie CSS, żeby uniknąć mrugania tekstu
                    // zanim załaduje się JS
                    color: 'var(--foreground)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: '10px', textTransform: 'none' },
                containedPrimary: {
                    boxShadow: '0 8px 22px rgba(255,122,24,0.16)',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(255,122,24,0.24)' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    // Wyłączamy nakładkę rozjaśniającą w dark mode, bo używamy zmiennej
                    backgroundImage: 'none',
                    backgroundColor: 'var(--paper)',
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: 'var(--background)',
                        '& fieldset': { borderColor: mode === 'light' ? '#e6eef8' : '#333333' },
                    },
                },
            }
        }
    },
});