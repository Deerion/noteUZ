import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // GET - lista notatek
    if (req.method === 'GET') {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (req.headers.cookie) {
                headers['Cookie'] = req.headers.cookie;
            }

            const response = await fetch(
                `${SPRING_API_URL}/api/notes`,
                {
                    method: 'GET',
                    headers
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Notes List] Backend error:`, errorText);
                return res.status(response.status).json({
                    message: errorText || 'Błąd pobierania notatek'
                });
            }

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error('[Notes List] Fetch error:', error);
            return res.status(500).json({
                message: 'Błąd połączenia z backendem'
            });
        }
    }

    // POST - tworzenie notatki
    if (req.method === 'POST') {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (req.headers.cookie) {
                headers['Cookie'] = req.headers.cookie;
            }

            const response = await fetch(
                `${SPRING_API_URL}/api/notes`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(req.body)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Note Create] Backend error:`, errorText);
                return res.status(response.status).json({
                    message: errorText || 'Błąd tworzenia notatki'
                });
            }

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error('[Note Create] Fetch error:', error);
            return res.status(500).json({
                message: 'Błąd połączenia z backendem'
            });
        }
    }

    return res.status(405).json({ message: 'Metoda niedozwolona' });
}
