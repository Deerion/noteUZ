import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

        if (req.method === 'PUT') {
            // Zmiana uprawnień
            const { shareId, permission } = req.body;
            const response = await fetch(`${SPRING_API_URL}/api/notes/share/${shareId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ permission })
            });
            if (!response.ok) return res.status(response.status).json({ message: 'Error' });
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            // Usunięcie dostępu
            const { shareId } = req.query;
            const response = await fetch(`${SPRING_API_URL}/api/notes/share/${shareId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) return res.status(response.status).json({ message: 'Error' });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        return res.status(500).json({ message: 'Backend connection error' });
    }
}