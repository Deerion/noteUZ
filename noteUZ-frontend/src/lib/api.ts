// src/lib/api.ts

// Pobieramy adres API. Domyślnie pusty string (dla Next.js proxy)
const API = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
    // Opcjonalna flaga, aby uniknąć pętli nieskończonej przy refreshu
    _retry?: boolean;
}

export async function apiFetch<T>(path: string, init: FetchOptions = {}): Promise<T> {
    // 1. Wykonaj pierwotne zapytanie
    let res = await fetch(`${API}${path}`, {
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
        // Jeśli to nie jest już próba odświeżenia (żeby uniknąć pętli)
        try {
            // Próbujemy odświeżyć token
            const refreshRes = await fetch(`${API}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Wysyłamy ciasteczko refresh token
            });

            if (refreshRes.ok) {
                // Jeśli odświeżenie się uda, powtarzamy oryginalne zapytanie
                // Ustawiamy flagę _retry, żeby nie zapętlić się w nieskończoność
                return apiFetch<T>(path, { ...init, _retry: true });
            }
        } catch (error) {
            console.error('Błąd podczas odświeżania tokena:', error);
            // Jeśli refresh się nie uda (np. sieć padła), nic nie robimy,
            // kod przejdzie niżej i rzuci błędem 401, co wyloguje usera.
        }
    }

    // 3. Standardowa obsługa błędów (dla innych statusów lub gdy refresh się nie udał)
    if (!res.ok) {
        let message = `API ${res.status}`;
        try {
            const data = await res.json();
            if (data && typeof data.message === 'string') {
                message = data.message;
            } else {
                const txt = await res.text();
                if (txt) message = `API ${res.status}: ${txt}`;
            }
        } catch {
            const txt = await res.text().catch(() => '');
            if (txt) message = `API ${res.status}: ${txt}`;
        }
        throw new Error(message);
    }

    // 4. Obsługa statusu 204 (No Content)
    if (res.status === 204) return undefined as unknown as T;

    // 5. Zwrócenie danych JSON
    return res.json() as Promise<T>;
}