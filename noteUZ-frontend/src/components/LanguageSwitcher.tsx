// src/components/LanguageSwitcher.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function LanguageSwitcher() {
    const router = useRouter();
    const { pathname, asPath, query, locale } = router;

    const nextLocale = locale === 'pl' ? 'en' : 'pl';

    // ZMIANA LOGIKI:
    // Jeśli aktualny to PL -> pokaż 'EN' (jako cel)
    // Jeśli aktualny to EN -> pokaż 'PL' (jako cel)
    const label = locale === 'pl' ? 'EN' : 'PL';

    return (
        <Link
            href={{ pathname, query }}
            as={asPath}
            locale={nextLocale}
            passHref
            legacyBehavior
        >
            <Button
                component="a"
                title={locale === 'pl' ? 'Przełącz na angielski' : 'Switch to Polish'}
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