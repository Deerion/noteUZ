import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    // Proxy dla GET /api/groups/invitations
    if (req.method === 'GET') {
        try {
            const response = await fetch(`${SPRING_API_URL}/api/groups/invitations`, { headers });
            const data = await response.json();
            return res.status(response.status).json(data);
        } catch (error) {
            return res.status(500).json([]);
        }
    }

    return res.status(405).end();
}