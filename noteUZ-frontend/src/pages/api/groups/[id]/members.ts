// src/pages/api/groups/[id]/members.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        // Tylko POST (dodawanie) - usuwanie i edycja są w pliku [targetUserId].ts
        if (req.method === 'POST') {
            const response = await fetch(`${SPRING_API_URL}/api/groups/${id}/members`, {
                method: 'POST',
                headers,
                body: JSON.stringify(req.body),
            });

            if (response.status === 204) return res.status(204).end();
            const text = await response.text();
            try {
                return res.status(response.status).json(JSON.parse(text));
            } catch {
                return res.status(response.status).send(text);
            }
        } else {
            res.setHeader('Allow', ['POST']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
}