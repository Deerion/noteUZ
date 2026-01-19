import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Tylko GET dozwolony' });
    }

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (req.headers.cookie) {
            headers['Cookie'] = req.headers.cookie;
        }

        const response = await fetch(
            `${SPRING_API_URL}/api/notes/shared`,
            {
                method: 'GET',
                headers
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Shared Notes] Backend error:`, errorText);
            return res.status(response.status).json({
                message: errorText || 'Błąd pobierania udostępnionych notatek'
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('[Shared Notes] Fetch error:', error);
        return res.status(500).json({
            message: 'Błąd połączenia z backendem'
        });
    }
}
