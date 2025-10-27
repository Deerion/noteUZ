// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Helper do fetch z JWT
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

// Przykładowe funkcje API
export const api = {
    // Auth
    login: (email: string, password: string) =>
        fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (email: string, password: string, name: string) =>
        fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),

    // Notes
    getNotes: () => fetchWithAuth('/notes'),

    createNote: (title: string, content: string) =>
        fetchWithAuth('/notes', {
            method: 'POST',
            body: JSON.stringify({ title, content }),
        }),

    // Groups
    getGroups: () => fetchWithAuth('/groups'),

    joinGroup: (groupId: number) =>
        fetchWithAuth(`/groups/${groupId}/join`, { method: 'POST' }),
};
