// src/pages/api/groups/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        let response: Response;

        switch (req.method) {
            case 'GET':
                response = await fetch(`${SPRING_API_URL}/api/groups`, { method: 'GET', headers });
                break;
            case 'POST':
                response = await fetch(`${SPRING_API_URL}/api/groups`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(req.body),
                });
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        const data = await response.text();
        try {
            const json = JSON.parse(data);
            return res.status(response.status).json(json);
        } catch {
            return res.status(response.status).send(data);
        }
    } catch (error) {
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}