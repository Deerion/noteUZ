// src/pages/api/notes/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Pobieramy adres backendu (Spring Boot) ze zmiennych środowiskowych
// Jeśli nie ustawione, domyślnie localhost:8080 (standard Springa)
const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query; // Pobieramy ID z URL (np. UUID notatki)

    // Upewniamy się, że ID jest stringiem
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'Nieprawidłowe ID notatki' });
    }

    // Przygotowujemy nagłówki (ważne: przekazujemy Cookie autoryzacyjne!)
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
    }

    try {
        let response: Response;

        // Przekierowanie metod HTTP z Next.js do Spring Boot
        switch (req.method) {
            case 'GET':
                response = await fetch(`${SPRING_API_URL}/api/notes/${id}`, {
                    method: 'GET',
                    headers,
                });
                break;

            case 'PUT':
                response = await fetch(`${SPRING_API_URL}/api/notes/${id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(req.body),
                });
                break;

            case 'DELETE':
                response = await fetch(`${SPRING_API_URL}/api/notes/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        // Obsługa odpowiedzi z Backend (Java)
        if (response.status === 204) {
            // Brak treści (często przy DELETE)
            return res.status(204).end();
        }

        // Próbujemy odczytać JSON, jeśli backend go zwrócił
        const data = await response.text();

        try {
            const json = JSON.parse(data);
            return res.status(response.status).json(json);
        } catch {
            // Jeśli to nie JSON (np. pusty string), zwracamy status
            if (response.ok) return res.status(response.status).json({});
            return res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ message: 'Błąd połączenia z serwerem backendu' });
    }
}