import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'Brak tokena' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Tylko POST dozwolony' });
    }

    try {
        // WAŻNE: Tutaj musi być pełna ścieżka do backendu: /api/notes/share/...
        const backendUrl = `${SPRING_API_URL}/api/notes/share/${id}/accept`;
        console.log(`[Accept] Calling backend: ${backendUrl}`);

        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (req.headers.cookie) {
            headers['Cookie'] = req.headers.cookie;
        }

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers
        });

        if (response.status === 204 || response.status === 200) {
            return res.status(200).json({ success: true });
        }

        const errorText = await response.text();
        console.error(`[Accept] Backend error ${response.status}:`, errorText);

        // Przekazujemy błąd z backendu, żeby łatwiej debugować
        return res.status(response.status).json({
            message: errorText || 'Błąd akceptacji po stronie serwera'
        });

    } catch (error) {
        console.error('[Accept] Fetch error:', error);
        return res.status(500).json({
            message: 'Błąd połączenia z backendem'
        });
    }
}