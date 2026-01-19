import type { NextApiRequest, NextApiResponse } from 'next';

// Ważne: Wyłączamy domyślny body parser Next.js, żeby przesłać plik jako strumień
export const config = {
    api: {
        bodyParser: false,
    },
};

const SPRING_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const cookie = req.headers.cookie || '';

    // Przekazujemy strumień bezpośrednio do backendu Java
    try {
        const backendRes = await fetch(`${SPRING_API_URL}/api/users/avatar`, {
            method: 'POST',
            headers: {
                'Cookie': cookie,
                // Nie ustawiaj Content-Type ręcznie na multipart/form-data!
                // Przeglądarka wysyła boundary, a my po prostu przekazujemy oryginalny nagłówek.
                'Content-Type': req.headers['content-type'] || '',
            },
            // Przekazujemy 'req' (strumień) jako body.
            // Używamy @ts-expect-error, bo definicje typów Next.js/Node fetch mogą się tu gryźć,
            // ale w runtime (Node 18+) to działa poprawnie.
            // @ts-expect-error: Node fetch accepts streams
            body: req,

            duplex: 'half',
        });

        if (backendRes.ok) {
            return res.status(200).json({ message: 'Avatar updated' });
        } else {
            return res.status(backendRes.status).send(await backendRes.text());
        }
    } catch (error) {
        console.error('Avatar upload error:', error);
        return res.status(500).json({ message: 'Upload failed' });
    }
}