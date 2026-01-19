import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // ID grupy
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        let response: Response;

        if (req.method === 'GET') {
            response = await fetch(`${SPRING_API_URL}/api/groups/${id}/notes`, {
                method: 'GET',
                headers,
                cache: 'no-store'
            });
        } else if (req.method === 'POST') {
            response = await fetch(`${SPRING_API_URL}/api/groups/${id}/notes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(req.body),
            });
        } else {
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