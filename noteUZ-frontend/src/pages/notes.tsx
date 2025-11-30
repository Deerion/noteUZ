import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import s from '../styles/Notes.module.css';

// Typ Notatki
type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function NotesPage() {
    const router = useRouter();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Stan Edytora
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false); // Nowy stan dla podglądu

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 1. Pobieranie notatek
    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API}/api/notes`, { credentials: 'include' });
            if (res.status === 401) { router.push('/login'); return; }
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, []);

    // 2. Obsługa Edytora
    const openEditor = (note?: Note) => {
        if (note) {
            setCurrentNoteId(note.id);
            setTitle(note.title);
            setContent(note.content);
        } else {
            setCurrentNoteId(null);
            setTitle('');
            setContent('');
        }
        setPreviewMode(false); // Zawsze otwieraj w trybie edycji
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setTitle('');
        setContent('');
        setCurrentNoteId(null);
        setPreviewMode(false);
    };

    // 3. Zapisywanie
    const handleSave = async () => {
        if (!content.trim()) {
            toast.error('Notatka nie może być pusta');
            return;
        }
        setSaving(true);
        const toastId = toast.loading('Zapisywanie...');

        try {
            // Workaround: usuń starą wersję przed zapisem nowej
            if (currentNoteId) {
                await fetch(`${API}/api/notes/${currentNoteId}`, { method: 'DELETE', credentials: 'include' });
            }

            const res = await fetch(`${API}/api/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                toast.success('Zapisano pomyślnie!', { id: toastId });
                closeEditor();
                fetchNotes();
            } else {
                toast.error('Błąd zapisu', { id: toastId });
            }
        } catch {
            toast.error('Błąd połączenia', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    // 4. Usuwanie
    const handleDelete = async (id: string) => {
        if (!confirm('Usunąć notatkę trwale?')) return;

        const toastId = toast.loading('Usuwanie...');
        try {
            const res = await fetch(`${API}/api/notes/${id}`, { method: 'DELETE', credentials: 'include' });
            if(res.ok) {
                setNotes(prev => prev.filter(n => n.id !== id));
                if (isEditorOpen && currentNoteId === id) closeEditor();
                toast.success('Usunięto', { id: toastId });
            } else {
                toast.error('Błąd usuwania', { id: toastId });
            }
        } catch (e) {
            toast.error('Błąd serwera', { id: toastId });
        }
    };

    // --- ULEPSZONE FORMATOWANIE ---
    const insertFormat = (prefix: string, suffix: string = '') => {
        if (!textareaRef.current) return;

        // Jeśli jesteśmy w trybie podglądu, przełącz na edycję, żeby sformatować
        if (previewMode) setPreviewMode(false);

        const field = textareaRef.current;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const text = field.value;

        // INLINE
        if (suffix) {
            const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
            setContent(newText);
            setTimeout(() => {
                field.focus();
                field.setSelectionRange(start + prefix.length, end + prefix.length);
            }, 0);
            return;
        }

        // BLOCK
        let lineStart = text.lastIndexOf('\n', start - 1) + 1;
        if (lineStart === -1) lineStart = 0;

        let lineEnd = text.indexOf('\n', start);
        if (lineEnd === -1) lineEnd = text.length;

        const lineContent = text.substring(lineStart, lineEnd);

        const blockPrefixes = ['# ', '## ', '- ', '> '];
        let cleanLine = lineContent;
        let existingPrefix = '';

        for (const p of blockPrefixes) {
            if (lineContent.startsWith(p)) {
                cleanLine = lineContent.substring(p.length);
                existingPrefix = p;
                break;
            }
        }

        let newLine = '';
        if (existingPrefix === prefix) {
            newLine = cleanLine;
        } else {
            newLine = prefix + cleanLine;
        }

        const newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd);
        setContent(newText);

        setTimeout(() => {
            field.focus();
            const newCursorPos = lineStart + newLine.length;
            field.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <>
            <Head>
                <title>Dokumenty | NoteUZ</title>
            </Head>

            <div className={s.page}>
                <header className={s.nav}>
                    <Link href="/" className={s.brand}>
                        <div className={s.logoIcon}>📝</div>
                        <span>NoteUZ</span>
                    </Link>
                    <div style={{display:'flex', gap:16, alignItems:'center'}}>
                        {/* Usunięto link "Strona główna" - nawigacja przez logo */}
                        <ThemeToggle />
                    </div>
                </header>

                <main className={s.container}>
                    <div className={s.headerRow}>
                        <h1 className={s.title}>Twoje dokumenty</h1>
                        <button className={s.createBtn} onClick={() => openEditor()}>
                            <span>+</span> Nowa notatka
                        </button>
                    </div>

                    {loading ? (
                        <p style={{color:'#888'}}>Ładowanie dokumentów...</p>
                    ) : notes.length === 0 ? (
                        <div style={{textAlign:'center', padding:60, color:'#888', border:'2px dashed var(--border)', borderRadius:16}}>
                            <h3>Pusto tutaj</h3>
                            <p>Kliknij przycisk "Nowa notatka", aby utworzyć swój pierwszy dokument.</p>
                        </div>
                    ) : (
                        <div className={s.notesGrid}>
                            {notes.map(note => (
                                <div key={note.id} className={s.noteCard} onClick={() => openEditor(note)}>
                                    <h3 className={s.noteTitle}>{note.title || 'Dokument bez tytułu'}</h3>
                                    <div className={s.notePreview}>
                                        <ReactMarkdown>{note.content.substring(0, 200)}</ReactMarkdown>
                                    </div>
                                    <span className={s.noteDate}>
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {isEditorOpen && (
                    <div className={s.editorOverlay} onClick={closeEditor}>
                        <div className={s.editorPaper} onClick={e => e.stopPropagation()}>
                            <div className={s.editorToolbar}>
                                {/* GŁÓWNY PRZYCISK: Przełącznik Podglądu (TEKSTOWY) */}
                                <button
                                    className={`${s.toggleModeBtn} ${previewMode ? s.toggleModeBtnActive : ''}`}
                                    onClick={() => setPreviewMode(!previewMode)}
                                >
                                    {previewMode ? 'Wróć do edycji' : 'Zobacz podgląd'}
                                </button>

                                {/* Pionowy separator */}
                                <div style={{width: 1, background: 'var(--border)', height: 20, margin: '0 8px'}} />

                                {/* Przyciski formatowania */}
                                <button className={s.toolBtn} onClick={() => insertFormat('**', '**')} title="Pogrubienie"><b>B</b></button>
                                <button className={s.toolBtn} onClick={() => insertFormat('_', '_')} title="Kursywa"><i>I</i></button>

                                <div style={{width: 1, background: 'var(--border)', height: 20, margin: '0 8px'}} />

                                <button className={s.toolBtn} onClick={() => insertFormat('# ')} title="Nagłówek 1">H1</button>
                                <button className={s.toolBtn} onClick={() => insertFormat('## ')} title="Nagłówek 2">H2</button>
                                <button className={s.toolBtn} onClick={() => insertFormat('- ')} title="Lista">•</button>

                                <div style={{flex:1}} />
                                <button className={s.toolBtn} onClick={closeEditor} title="Zamknij">✕</button>
                            </div>

                            <div className={s.editorContent}>
                                <input
                                    className={s.inputTitle}
                                    placeholder="Tytuł dokumentu"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />

                                {previewMode ? (
                                    <div className={s.markdownPreview}>
                                        <ReactMarkdown>{content || '*Brak treści*'}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea
                                        ref={textareaRef}
                                        className={s.textareaBody}
                                        placeholder="Zacznij pisać tutaj... (Użyj Markdown)"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className={s.editorActions}>
                                {currentNoteId ? (
                                    <button className={s.deleteBtn} onClick={() => handleDelete(currentNoteId)}>
                                        Usuń
                                    </button>
                                ) : <div />}

                                <div style={{display:'flex', gap:12}}>
                                    <button className={s.cancelBtn} onClick={closeEditor}>
                                        Anuluj
                                    </button>
                                    <button className={s.saveBtn} onClick={handleSave} disabled={saving || !content}>
                                        {saving ? 'Zapisywanie...' : 'Zapisz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}