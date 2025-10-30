import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

type Props = { notes: string[]; status: number; error?: string };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL!;
    try {
        const res = await fetch(`${API}/api/notes`, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        let notes: unknown = [];
        try {
            notes = await res.json();
        } catch {
            // nic – dla 204/empty itp.
        }

        return {
            props: {
                notes: Array.isArray(notes) ? (notes as string[]) : [],
                status: res.status,
            },
        };
    } catch (e: any) {
        // Fetch nie doszedł (ECONNREFUSED, ENOTFOUND, timeout)
        return {
            redirect: {
                destination: `/error?code=503&msg=${encodeURIComponent('Backend niedostępny')}`,
                permanent: false,
            },
        };
    }
};

export default function NotesPage({
                                      notes,
                                      status,
                                  }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div>
            <p>Status backendu: {status}</p>
            <ul>{notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
    );
}
