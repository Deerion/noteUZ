// src/lib/api.ts

// Pobieramy adres API. Domyślnie pusty string (dla Next.js proxy)
const API = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
    // Opcjonalna flaga, aby uniknąć pętli nieskończonej przy refreshu
    _retry?: boolean;
}

export async function apiFetch<T>(path: string, init: FetchOptions = {}): Promise<T> {
    // 1. Wykonaj pierwotne zapytanie
    // ZMIANA: const zamiast let (naprawa ESLint)
    const res = await fetch(`${API}${path}`, {
        ...init,
        credentials: 'include', // Kluczowe: wysyła i odbiera ciasteczka
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });

    // 2. Obsługa wygaśnięcia sesji (Status 401)
    if (res.status === 401 && !init._retry) {
        try {
            // Próbujemy odświeżyć token
            const refreshRes = await fetch(`${API}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (refreshRes.ok) {
                // Jeśli odświeżenie się uda, powtarzamy oryginalne zapytanie
                return apiFetch<T>(path, { ...init, _retry: true });
            }
        } catch (error) {
            console.error('Błąd podczas odświeżania tokena:', error);
        }
    }

    // 3. Standardowa obsługa błędów HTTP
    if (!res.ok) {
        let message = `API ${res.status}`;
        try {
            const data = await res.json();
            if (data && typeof data.message === 'string') {
                message = data.message;
            } else {
                const txt = await res.text();
                if (txt) message = txt;
            }
        } catch {
            // Ignorujemy błędy parsowania przy błędzie HTTP
        }
        throw new Error(message);
    }

    // 4. Obsługa statusu 204 (No Content)
    if (res.status === 204) return undefined as unknown as T;

    // 5. BEZPIECZNE parsowanie odpowiedzi (NAPRAWA BŁĘDU JSON)
    // Pobieramy tekst zamiast od razu JSON
    const text = await res.text();

    // Jeśli odpowiedź jest pusta (np. 200 OK bez body), zwracamy pusty obiekt/undefined
    if (!text) return undefined as unknown as T;

    try {
        // Próbujemy sparsować JSON
        return JSON.parse(text);
    } catch {
        // Jeśli to nie JSON (np. zwykły string "Success"), zwracamy jako tekst
        return text as unknown as T;
    }
}