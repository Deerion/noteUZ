// src/pages/api/friends/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
    }

    try {
        let response: Response;

        switch (req.method) {
            case 'PUT':
                // Java: PUT /api/friends/{id}/accept
                // Wywołujemy specyficzny endpoint do akceptacji
                response = await fetch(`${SPRING_API_URL}/api/friends/${id}/accept`, {
                    method: 'PUT',
                    headers,
                });
                break;

            case 'DELETE':
                // Java: DELETE /api/friends/{id}
                response = await fetch(`${SPRING_API_URL}/api/friends/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                break;

            default:
                res.setHeader('Allow', ['PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        if (response.status === 204) return res.status(204).end();

        const data = await response.text();
        try {
            const json = JSON.parse(data);
            return res.status(response.status).json(json);
        } catch {
            return res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('Friends ID API Error:', error);
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}