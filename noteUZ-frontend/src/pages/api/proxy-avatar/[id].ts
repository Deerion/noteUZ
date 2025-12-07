import type { NextApiRequest, NextApiResponse } from 'next';

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    try {
        // Po prostu przekierowujemy request GET do Javy
        const backendRes = await fetch(`${SPRING_API_URL}/api/users/${id}/avatar`);

        if (!backendRes.ok) {
            // Jeśli nie ma avatara (404), zwracamy 404 - Frontend wyświetli literkę
            return res.status(404).end();
        }

        const contentType = backendRes.headers.get('content-type') || 'image/jpeg';
        const buffer = await backendRes.arrayBuffer();

        res.setHeader('Content-Type', contentType);
        // Ważne: Cache control, żeby przeglądarka pamiętała obrazek przez np. godzinę
        res.setHeader('Cache-Control', 'public, max-age=3600');

        return res.send(Buffer.from(buffer));

    } catch (error) {
        return res.status(500).end();
    }
}