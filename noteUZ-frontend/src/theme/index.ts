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
            default: 'var(--background)',
            paper: 'var(--paper)',
        },
        text: {
            primary: mode === 'light' ? '#1c1b1f' : '#e6e1e5',
            secondary: mode === 'light' ? '#49454f' : '#cac4d0',
        },
        divider: mode === 'light' ? '#e0e0e0' : '#444',
    },
    shape: {
        borderRadius: 16, // Nowoczesne, większe zaokrąglenie (MD3)
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                },
            },
        },
        // KARTY: Płaskie, z obramowaniem, bez cienia
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'var(--paper)',
                    borderRadius: '16px',
                    boxShadow: 'none', // ZERO cienia domyślnie
                    border: mode === 'light' ? '1px solid #e6e6e6' : '1px solid #333',
                    display: 'flex',
                    flexDirection: 'column',
                }
            }
        },
        // PRZYCISKI: Zaokrąglone (Pill shape)
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '100px',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                },
                containedPrimary: {
                    '&:hover': { backgroundColor: '#e66e15' }
                }
            },
        },
        // CHIPY: Subtelne
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: '8px', fontWeight: 500 }
            }
        },
        // DIALOGI
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
            }
        }
    },
});