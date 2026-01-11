import type { NextApiRequest, NextApiResponse } from 'next';

// Pobiera adres backendu z pliku .env (np. http://localhost:8080)
const API = process.env.NEXT_PUBLIC_API_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    // Przekazujemy ciasteczko sesyjne (JWT) do backendu
    const cookieHeader = req.headers.cookie || '';

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        }
    };

    if (method !== 'GET' && method !== 'DELETE') {
        options.body = JSON.stringify(body);
    }

    try {
        // Przekierowanie żądania do Spring Boot: /api/events
        const backendRes = await fetch(`${API}/api/events`, options);

        // Obsługa pustej odpowiedzi (np. przy DELETE)
        if (backendRes.status === 204) {
            res.status(204).end();
            return;
        }

        const data = await backendRes.json();
        res.status(backendRes.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ message: 'Błąd połączenia z serwerem (Backend is down?)' });
    }
}