// src/pages/api/notes/[id]/email.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { id } = req.query; // ID notatki
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    // Przekazujemy ciasteczko sesji
    if (req.headers.cookie) headers['Cookie'] = req.headers.cookie;

    try {
        const response = await fetch(`${SPRING_API_URL}/api/notes/${id}/email`, {
            method: 'POST',
            headers,
            body: JSON.stringify(req.body), // { email: "..." }
        });

        if (response.status === 204) return res.status(200).json({ sent: true }); // Sukces
        if (!response.ok) {
            const txt = await response.text();
            return res.status(response.status).json({ message: txt || 'Błąd wysyłania' });
        }

        return res.status(200).json({ sent: true });

    } catch (error) {
        return res.status(500).json({ message: 'Backend unavailable' });
    }
}