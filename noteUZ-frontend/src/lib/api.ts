// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
        // dla Server Components domyślne cachowanie można kontrolować:
        cache: 'no-store',
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}
