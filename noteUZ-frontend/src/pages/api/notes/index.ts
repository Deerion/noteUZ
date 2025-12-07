// src/pages/api/notes/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Nagłówki z ciasteczkami sesji
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
    }

    try {
        let response: Response;

        switch (req.method) {
            case 'GET':
                // Pobieranie listy notatek
                response = await fetch(`${SPRING_API_URL}/api/notes`, {
                    method: 'GET',
                    headers,
                    cache: 'no-store'
                });
                break;

            case 'POST':
                // Tworzenie nowej notatki
                response = await fetch(`${SPRING_API_URL}/api/notes`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(req.body),
                });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        // Przekazanie odpowiedzi z Javy do Frontendu
        const data = await response.text();
        try {
            const json = JSON.parse(data);
            return res.status(response.status).json(json);
        } catch {
            return res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('API Notes Error:', error);
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}