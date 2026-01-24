import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export default function LanguageSwitcher() {
    const router = useRouter();
    const { pathname, asPath, query, locale } = router;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (newLocale: string) => {
        // Przekierowanie na ten sam URL, ale z nowym locale
        router.push({ pathname, query }, asPath, { locale: newLocale });
        handleClose();
    };

    // Etykieta przycisku
    const getLabel = (loc?: string) => {
        if (loc === 'pl') return 'PL';
        return 'EN';
    };

    return (
        <>
            <Button
                id="language-button"
                aria-controls={open ? 'language-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                variant="outlined"
                color="inherit"
                title="Zmień język / Change Language"
                startIcon={<LanguageIcon fontSize="small" />}
                sx={{
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    minWidth: 70,
                    height: 40,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                        backgroundColor: 'background.paper',
                        borderColor: 'text.secondary',
                    }
                }}
            >
                {getLabel(locale)}
            </Button>

            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'language-button',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={() => changeLanguage('pl')} selected={locale === 'pl'}>
                    Polski
                </MenuItem>
                <MenuItem onClick={() => changeLanguage('en')} selected={locale === 'en'}>
                    English
                </MenuItem>
            </Menu>
        </>
    );
}