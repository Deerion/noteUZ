// pages/api/notes.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const r = await fetch(`${API}/api/notes`, { cache: 'no-store' });
        const data = await r.json();
        return res.status(r.status).json(data);
    }
    if (req.method === 'POST') {
        const r = await fetch(`${API}/api/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await r.json();
        return res.status(r.status).json(data);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
}
