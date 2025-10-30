// pages/error.tsx
import { useRouter } from 'next/router';

const titles: Record<string, string> = {
    '401': 'Brak uprawnień',
    '403': 'Dostęp zabroniony',
    '404': 'Nie znaleziono',
    '500': 'Błąd serwera',
    '503': 'Serwis niedostępny',
};

export default function ErrorPage() {
    const { query } = useRouter();
    const code = (query.code as string) ?? '500';
    const msg = (query.msg as string) ?? 'Wystąpił błąd';
    const title = titles[code] ?? 'Błąd';

    return (
        <main style={{ padding: 24 }}>
            <h1>{title} ({code})</h1>
            <p>{msg}</p>
            {code === '401' && <a href="/login">Zaloguj się</a>}
            {code === '503' && <button onClick={() => location.reload()}>Spróbuj ponownie</button>}
            <div style={{ marginTop: 16 }}>
                <a href="/">Strona główna</a>
            </div>
        </main>
    );
}
