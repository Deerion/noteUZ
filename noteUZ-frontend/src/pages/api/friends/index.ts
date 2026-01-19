// src/pages/api/friends/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Przygotuj nagłówki (przekaż ciasteczko auth)
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
    }

    try {
        let response: Response;

        // 2. Obsługa metod
        switch (req.method) {
            case 'GET':
                // Java: GET /api/friends
                response = await fetch(`${SPRING_API_URL}/api/friends`, {
                    method: 'GET',
                    headers,
                    cache: 'no-store'
                });
                break;

            case 'POST':
                // Java: POST /api/friends/invite (body: { email: "..." })
                response = await fetch(`${SPRING_API_URL}/api/friends/invite`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(req.body),
                });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        // 3. Przetwarzanie odpowiedzi z Javy
        if (response.status === 204) return res.status(204).end();

        const data = await response.text();
        try {
            const json = JSON.parse(data);
            return res.status(response.status).json(json);
        } catch {
            if (response.ok) return res.status(response.status).json({});
            return res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('Friends API Error:', error);
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}