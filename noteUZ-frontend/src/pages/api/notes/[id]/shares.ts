import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

        const response = await fetch(`${SPRING_API_URL}/api/notes/${id}/shares`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            return res.status(response.status).end();
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Backend connection error' });
    }
}