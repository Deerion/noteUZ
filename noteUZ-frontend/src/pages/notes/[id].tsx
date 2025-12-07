// src/pages/notes/[id].tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, FormEvent, useRef } from 'react';
// Importy UI
import {
    Box, TextField, Button as MuiButton, Paper, Grid, Alert, Divider,
    Typography, useTheme, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText
} from '@mui/material';
// Ikony
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email'; // <--- NOWA IKONA

// i18n
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Komponenty
import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Note } from '@/types/Note';

interface Props { note: Note; }

// --- SERVER SIDE ---
export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req, locale }) => {
    const noteId = params?.id;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const cookie = req.headers.cookie;

    const translations = await serverSideTranslations(locale ?? 'pl', ['common']);

    if (!noteId) return { notFound: true };

    try {
        const res = await fetch(`${API_URL}/api/notes/${noteId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...(cookie && { 'Cookie': cookie }) },
        });

        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error('Błąd pobierania');

        const note = (await res.json()) as Note;
        return { props: { note, ...translations } };
    } catch (e) {
        return { notFound: true };
    }
};

// --- CLIENT SIDE ---
export default function SingleNotePage({ note: initialNote }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { t } = useTranslation('common');
    const router = useRouter();
    const theme = useTheme();

    // Stan notatki
    const [title, setTitle] = useState(initialNote.title || '');
    const [content, setContent] = useState(initialNote.content || '');
    const [isEditing, setIsEditing] = useState(false);

    // Stany akcji
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Stan modala email
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [targetEmail, setTargetEmail] = useState('');

    // Ref do elementu, który będzie drukowany do PDF
    const printRef = useRef<HTMLDivElement>(null);

    // --- ZAPIS ---
    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (!res.ok) throw new Error(t('error_save_failed'));

            setIsEditing(false);
            router.reload();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('error_unknown'));
        } finally {
            setLoading(false);
        }
    }

    // --- USUWANIE ---
    async function handleDelete() {
        if (!confirm(t('confirm_delete'))) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notes/${initialNote.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t('error_delete_failed'));
            router.push('/notes');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('error_unknown'));
            setLoading(false);
        }
    }

    // --- EKSPORT PDF (POPRAWIONY) ---
    async function handleExportPdf() {
        if (!printRef.current) return;
        setExporting(true);
        setError(null);

        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDFModule = await import('jspdf');
            // @ts-ignore
            const JsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

            const element = printRef.current;

            // Pobieramy kolor tła (jasny/ciemny)
            let bgColor = '#ffffff';
            let textColor = '#000000';

            if (typeof window !== 'undefined') {
                const computed = getComputedStyle(document.body);
                // Jeśli jesteśmy w trybie ciemnym, wymuszamy biały papier do PDF (lepiej wygląda w druku)
                // lub zostawiamy ciemny, jeśli wolisz. Tu wymuszam biały dla estetyki dokumentu.
                const isDark = theme.palette.mode === 'dark';
                bgColor = isDark ? '#ffffff' : computed.getPropertyValue('--paper').trim() || '#ffffff';
                textColor = isDark ? '#000000' : computed.getPropertyValue('--foreground').trim() || '#000000';
            }

            // Tymczasowo zmieniamy style elementu, żeby na PDF wyglądał jak dokument
            const originalStyle = element.style.cssText;
            element.style.backgroundColor = bgColor;
            element.style.color = textColor;
            element.style.padding = '20px'; // Więcej oddechu
            // Jeśli dark mode, musimy zmienić kolory dzieci (tekstu) na chwilę, bo canvas to złapie
            // (To uproszczenie - w idealnym świecie klonujemy element, ale tu działamy na żywym)

            const canvas = await html2canvas(element, {
                scale: 3, // Wysoka jakość (3x)
                useCORS: true,
                backgroundColor: bgColor
            });

            // Przywracamy style
            element.style.cssText = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Marginesy
            const marginX = 15;
            const marginY = 20;
            const contentWidth = pdfWidth - (2 * marginX);

            // Obliczamy wysokość obrazka zachowując proporcje
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

            // --- NAGŁÓWEK PDF ---
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            // Usuwamy polskie znaki z nagłówka (jsPDF standard fonts nie mają UTF-8)
            const safeTitle = title.replace(/[^\x00-\x7F]/g, "");
            pdf.text(safeTitle || "Note", marginX, marginY);

            // Data
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            const dateStr = new Date().toLocaleDateString();
            pdf.text(`NoteUZ | ${dateStr}`, marginX, marginY + 6);

            // Linia oddzielająca
            pdf.setDrawColor(200);
            pdf.line(marginX, marginY + 10, pdfWidth - marginX, marginY + 10);

            // --- TREŚĆ NOTATKI (OBRAZEK) ---
            // Jeśli notatka jest dłuższa niż jedna strona, jsPDF sam jej nie podzieli idealnie przy addImage.
            // Tutaj robimy prosty wariant: wstawiamy obrazek pod nagłówkiem.

            let heightLeft = imgHeight;
            let position = marginY + 15; // Start pod linią

            // Pierwsza strona
            pdf.addImage(imgData, 'PNG', marginX, position, contentWidth, imgHeight);

            // --- STOPKA ---
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text("Wygenerowano przez NoteUZ", pdfWidth / 2, pdfHeight - 10, { align: 'center' });

            const safeFilename = title.replace(/[^a-z0-9żźćńółęśąŻŹĆŃÓŁĘŚĄ \-]/gi, '_');
            pdf.save(`NoteUZ_${safeFilename || 'notatka'}.pdf`);

        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : 'Wystąpił nieznany błąd';
            alert((t('error_export_failed') || 'Błąd eksportu') + ': ' + msg);
        } finally {
            setExporting(false);
        }
    }
    // --- WYSYŁANIE MAILA ---
    async function handleSendEmail() {
        if (!targetEmail || !targetEmail.includes('@')) {
            alert(t('invalid_email') || 'Podaj poprawny adres e-mail');
            return;
        }

        setSendingEmail(true);
        setEmailDialogOpen(false); // Zamykamy modal, pokazujemy loader/stan
        setError(null);
        setSuccessMsg(null);

        try {
            // Wywołujemy nasz endpoint w API (który przekaże do backendu)
            const res = await fetch(`/api/notes/${initialNote.id}/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t('error_send_email_failed'));
            }

            setSuccessMsg(t('email_sent_success') || 'Notatka została wysłana!');
            setTargetEmail(''); // Czyścimy pole
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('error_unknown'));
        } finally {
            setSendingEmail(false);
        }
    }

    // Style Markdown
    const markdownStyles = {
        '& h1, & h2, & h3': { color: 'text.primary', fontWeight: 800, mt: 3, mb: 1.5 },
        '& h1': { fontSize: '2rem', borderBottom: '1px solid', borderColor: 'divider', pb: 1 },
        '& p': { color: 'text.secondary', lineHeight: 1.7, mb: 2 },
        '& ul, & ol': { pl: 3, mb: 2, color: 'text.secondary' },
        '& a': { color: 'primary.main', textDecoration: 'none', fontWeight: 500 },
        '& blockquote': {
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            pl: 2.5, py: 0.5, my: 3,
            bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
            fontStyle: 'italic', color: 'text.primary'
        },
        '& code': {
            bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
            p: '2px 6px', borderRadius: '6px', fontFamily: 'monospace', color: theme.palette.secondary.main
        }
    };

    return (
        <>
            <Head><title>{title} — NoteUZ</title></Head>
            <NotesLayout
                title={isEditing ? t('edit_note_header') : t('view_note_header')}
                actionButton={<MuiButton startIcon={<ArrowBackIcon />} onClick={() => router.push('/notes')}>{t('btn_back')}</MuiButton>}
            >
                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                    <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 3 }}>

                        <TextField
                            label={t('label_title')}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            disabled={!isEditing}
                            fullWidth
                            variant={isEditing ? "outlined" : "standard"}
                            slotProps={{
                                input: { sx: { fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' } }
                            }}
                        />

                        {!isEditing ? (
                            <Box ref={printRef} sx={{ minHeight: 200, ...markdownStyles, p: 2 }}>
                                {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <Typography color="text.disabled" fontStyle="italic">{t('note_no_content')}</Typography>}
                            </Box>
                        ) : (
                            <MarkdownEditor value={content} onChange={setContent} minRows={15} />
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} justifyContent="flex-end">
                            {!isEditing ? (
                                <>
                                    <Grid>
                                        <MuiButton
                                            onClick={() => setEmailDialogOpen(true)}
                                            variant="outlined" color="primary"
                                            disabled={sendingEmail}
                                            startIcon={sendingEmail ? <CircularProgress size={20} /> : <EmailIcon />}
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            {t('btn_email') || "Wyślij"}
                                        </MuiButton>
                                    </Grid>
                                    <Grid>
                                        <MuiButton
                                            onClick={handleExportPdf}
                                            variant="outlined" color="secondary"
                                            disabled={exporting}
                                            startIcon={exporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            {t('btn_export_pdf') || "PDF"}
                                        </MuiButton>
                                    </Grid>
                                    <Grid><MuiButton onClick={() => setIsEditing(true)} variant="contained" startIcon={<EditIcon />} sx={{ borderRadius: '10px' }}>{t('btn_edit')}</MuiButton></Grid>
                                    <Grid><MuiButton onClick={handleDelete} color="error" variant="outlined" startIcon={<DeleteIcon />} sx={{ borderRadius: '10px' }}>{t('btn_delete')}</MuiButton></Grid>
                                </>
                            ) : (
                                <>
                                    <Grid><MuiButton onClick={() => { setIsEditing(false); }} disabled={loading} startIcon={<CloseIcon />} color="inherit">{t('btn_cancel')}</MuiButton></Grid>
                                    <Grid><MuiButton type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon />} sx={{ borderRadius: '10px' }}>{t('btn_save')}</MuiButton></Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </Paper>

                {/* MODAL DO WPISYWANIA MAILA */}
                <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
                    <DialogTitle>{t('email_modal_title') || "Wyślij notatkę"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('email_modal_desc') || "Podaj adres e-mail, na który chcesz wysłać tę notatkę."}
                        </DialogContentText>
                        <TextField
                            autoFocus margin="dense"
                            label="Adres e-mail"
                            type="email"
                            fullWidth variant="outlined"
                            value={targetEmail}
                            onChange={(e) => setTargetEmail(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <MuiButton onClick={() => setEmailDialogOpen(false)}>{t('btn_cancel')}</MuiButton>
                        <MuiButton onClick={handleSendEmail} variant="contained">{t('btn_send') || "Wyślij"}</MuiButton>
                    </DialogActions>
                </Dialog>

            </NotesLayout>
        </>
    );
}