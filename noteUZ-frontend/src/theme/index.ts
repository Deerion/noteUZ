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
        divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)', // Bardzo delikatne linie
    },
    shape: {
        borderRadius: 12, // Wyważone zaokrąglenie dla kart (nie za duże)
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
        // --- BUTTONS (Flat & Filled) ---
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '100px', // Stadionowy kształt
                    boxShadow: 'none',     // ZERO CIENIA
                    padding: '10px 24px',
                    '&:hover': {
                        boxShadow: 'none', // Nawet przy hover bez cienia, tylko zmiana koloru
                        backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                    }
                },
                containedPrimary: {
                    // Płaski przycisk, bez cienia
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                        backgroundColor: '#e66e15', // Ciemniejszy odcień przy hover
                    },
                },
                outlined: {
                    borderWidth: '1px',
                    borderColor: mode === 'light' ? '#79747e' : '#938f99',
                    '&:hover': {
                        borderWidth: '1px',
                        backgroundColor: mode === 'light' ? 'rgba(255,122,24,0.04)' : 'rgba(255,122,24,0.08)',
                    }
                }
            },
        },
        // --- CARDS (Outlined/Flat surface instead of Elevated) ---
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'var(--paper)',
                    // Zamiast cienia, używamy subtelnej ramki (Outline variant w MD3)
                    boxShadow: 'none',
                    border: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #333',
                },
                elevation0: {
                    border: 'none', // Dla przezroczystych kontenerów
                },
                rounded: {
                    borderRadius: '16px', // Karty trochę bardziej zaokrąglone niż inputy
                }
            },
        },
        // --- INPUTS (Filled Style, less outline) ---
        MuiTextField: {
            defaultProps: {
                variant: 'outlined', // Technicznie outlined, ale wystylizujemy na filled
                size: 'small',
                fullWidth: true
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        // TŁO: Dodajemy tło, żeby pole było "Wypełnione" (Filled)
                        backgroundColor: mode === 'light' ? '#f0f2f5' : '#1e1e1e',
                        transition: 'all 0.2s',

                        // RAMKA: Usuwamy widoczną ramkę w stanie spoczynku (lub robimy bardzo bladą)
                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover': {
                            backgroundColor: mode === 'light' ? '#e4e6e9' : '#2a2a2a',
                            '& fieldset': { borderColor: 'transparent' },
                        },
                        // FOCUS: Dopiero przy pisaniu pojawia się akcent (ramka lub ring)
                        '&.Mui-focused': {
                            backgroundColor: 'transparent',
                            '& fieldset': {
                                borderColor: ORANGE_CTA,
                                borderWidth: '2px',
                            },
                        }
                    },
                },
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 500,
                    border: '1px solid transparent', // Domyślnie brak ramki
                },
                outlined: {
                    borderColor: mode === 'light' ? '#e0e0e0' : '#444',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '24px', // MD3 Dialogs
                    boxShadow: mode === 'light' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // Tutaj cień jest potrzebny dla warstwy
                    border: 'none',
                }
            }
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: ORANGE_CTA,
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 48,
                    '&.Mui-selected': { color: ORANGE_CTA }
                }
            }
        },
    },
});