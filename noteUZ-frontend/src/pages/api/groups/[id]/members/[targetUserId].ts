// src/pages/api/groups/[id]/members/[targetUserId].ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, targetUserId } = req.query; // Next.js sam wyciągnie oba ID ze ścieżki

    // Przekazujemy ciasteczka
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        let response: Response;
        const url = `${SPRING_API_URL}/api/groups/${id}/members/${targetUserId}`;

        if (req.method === 'DELETE') {
            response = await fetch(url, { method: 'DELETE', headers });
        } else if (req.method === 'PATCH') {
            response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(req.body)
            });
        } else {
            res.setHeader('Allow', ['DELETE', 'PATCH']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        if (response.status === 204) return res.status(204).end();

        // Obsługa błędów lub treści
        const text = await response.text();
        try {
            return res.status(response.status).json(JSON.parse(text));
        } catch {
            return res.status(response.status).send(text);
        }

    } catch (error) {
        return res.status(500).json({ message: 'Backend error' });
    }
}