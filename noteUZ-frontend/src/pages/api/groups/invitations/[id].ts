import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    // Proxy dla POST /api/groups/invitations/{id} (Accept/Reject)
    if (req.method === 'POST') {
        try {
            const response = await fetch(`${SPRING_API_URL}/api/groups/invitations/${id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(req.body) // { accept: true/false }
            });
            return res.status(response.status).end();
        } catch (error) {
            return res.status(500).end();
        }
    }

    return res.status(405).end();
}