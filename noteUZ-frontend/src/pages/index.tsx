import Link from 'next/link';

export default function Home() {
    return (
        <main style={{ padding: 24 }}>
            <h1>Home</h1>
            <Link href="/login">
                <button>Zaloguj</button>
            </Link>
        </main>
    );
}
