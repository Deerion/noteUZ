// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        ...init,
        credentials: 'include', // kluczowe dla cookie HttpOnly
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        // spróbuj odczytać JSON z message
        let message = `API ${res.status}`;
        try {
            const data = await res.json();
            if (data && typeof data.message === 'string') {
                message = data.message;
            } else {
                // jeżeli nie ma JSON, wróć do text()
                const txt = await res.text();
                if (txt) message = `API ${res.status}: ${txt}`;
            }
        } catch {
            const txt = await res.text().catch(() => '');
            if (txt) message = `API ${res.status}: ${txt}`;
        }
        throw new Error(message);
    }

    // przy 204 zwróć undefined
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
}
