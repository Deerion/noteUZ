// src/pages/api/groups/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        const response = await fetch(`${SPRING_API_URL}/api/groups/${id}`, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) return res.status(404).json({ message: 'Nie znaleziono grupy' });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}