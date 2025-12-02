// src/components/ThemeToggle.tsx
import { useThemeContext } from '../lib/ThemeContext'; // <-- Używamy hooka
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function ThemeToggle() {
    const { mode, toggleTheme } = useThemeContext(); // Pobieramy stan i funkcję z Contextu

    return (
        <IconButton
            onClick={toggleTheme}
            color="inherit"
            title={`Przełącz na motyw ${mode === 'light' ? 'ciemny' : 'jasny'}`}
            sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                width: 40,
                height: 40,
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'background.paper',
                    borderColor: 'text.secondary',
                },
                '&:active': {
                    transform: 'scale(0.95)',
                }
            }}
        >
            {mode === 'light' ? (
                <Brightness4Icon fontSize="small" />
            ) : (
                <Brightness7Icon fontSize="small" />
            )}
        </IconButton>
    );
}