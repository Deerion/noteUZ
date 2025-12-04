// src/components/LanguageSwitcher.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function LanguageSwitcher() {
    const router = useRouter();
    const { pathname, asPath, query, locale } = router;

    const nextLocale = locale === 'pl' ? 'en' : 'pl';
    const label = locale === 'pl' ? 'PL' : 'EN';

    return (
        <Link
            href={{ pathname, query }}
            as={asPath}
            locale={nextLocale}
            passHref
            legacyBehavior
        >
            <Button
                component="a" // Ważne: renderuje jako <a>, aby przyjąć href
                title={locale === 'pl' ? 'Switch to English' : 'Zmień na Polski'}
                variant="outlined"
                color="inherit"
                sx={{
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 40,
                    height: 40,
                    padding: '8px',
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
                {label}
            </Button>
        </Link>
    );
}