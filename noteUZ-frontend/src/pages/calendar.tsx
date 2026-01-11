import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Paper, Dialog, DialogTitle, DialogContent, TextField,
    DialogActions, Button, useTheme, DialogContentText, Snackbar, Alert,
    MenuItem, FormControl, InputLabel, Select, Chip, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share'; // Ikona dla udostępnionych

// FullCalendar imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { apiFetch } from '@/lib/api';
import { CalendarEvent } from '@/types/Event';
import { Note } from '@/types/Note';
import { Group } from '@/types/Group';

// Rozszerzony typ notatki do wyświetlania źródła
interface NoteWithSource extends Note {
    sourceLabel?: string; // np. "Prywatna", "Grupa X", "Udostępniona"
    sourceType: 'PRIVATE' | 'GROUP' | 'SHARED';
}

export default function CalendarPage() {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const router = useRouter();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [allNotes, setAllNotes] = useState<NoteWithSource[]>([]);

    const [openForm, setOpenForm] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        noteIds: [] as string[]
    });

    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // 1. GŁÓWNA FUNKCJA POBIERANIA DANYCH
    const fetchData = async () => {
        try {
            // Pobieramy równolegle: Wydarzenia, Moje Notatki, Udostępnione Notatki, Grupy
            const [eventsData, privateNotesData, sharedNotesData, groupsData] = await Promise.all([
                apiFetch<CalendarEvent[]>('/api/events'),
                apiFetch<Note[]>('/api/notes'),
                apiFetch<Note[]>('/api/notes/shared'), // <--- TO BYŁO KLUCZOWE
                apiFetch<Group[]>('/api/groups')
            ]);

            // Teraz pobieramy notatki dla każdej grupy
            const groupNotesPromises = groupsData.map(group =>
                apiFetch<Note[]>(`/api/groups/${group.id}/notes`)
                    .then(notes => notes.map(n => ({
                        ...n,
                        sourceLabel: `Grupa: ${group.name}`,
                        sourceType: 'GROUP' as const
                    })))
                    .catch(() => []) // Ignorujemy błędy pojedynczych grup
            );

            const groupNotesResults = await Promise.all(groupNotesPromises);
            const allGroupNotes = groupNotesResults.flat();

            // Formatowanie notatek prywatnych
            const formattedPrivateNotes = privateNotesData.map(n => ({
                ...n,
                sourceLabel: 'Prywatna',
                sourceType: 'PRIVATE' as const
            }));

            // Formatowanie notatek udostępnionych
            const formattedSharedNotes = sharedNotesData.map(n => ({
                ...n,
                sourceLabel: 'Udostępniona',
                sourceType: 'SHARED' as const
            }));

            setEvents(eventsData);
            // Łączymy wszystko w jedną listę
            setAllNotes([...formattedPrivateNotes, ...formattedSharedNotes, ...allGroupNotes]);

        } catch (e) {
            console.error("Błąd pobierania danych:", e);
            showSnackbar('Nie udało się pobrać danych (sprawdź konsolę).', 'error');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // --- Obsługa wyboru daty ---
    const handleDateSelect = (selectInfo: any) => {
        let startStr = selectInfo.startStr;
        let finalStart = selectInfo.allDay ? `${startStr}T09:00` : startStr.substring(0, 16);
        let finalEnd = selectInfo.allDay ? `${startStr}T10:00` : selectInfo.endStr.substring(0, 16);

        setEditingEventId(null);
        setFormData({
            title: '',
            description: '',
            start: finalStart,
            end: finalEnd,
            noteIds: []
        });
        setOpenForm(true);
    };

    // --- Obsługa kliknięcia "Edytuj" ---
    const handleEditClick = () => {
        if (!selectedEvent) return;
        const formatForInput = (isoString: string) => isoString ? isoString.substring(0, 16) : '';

        setFormData({
            title: selectedEvent.title,
            description: selectedEvent.description || '',
            start: formatForInput(selectedEvent.start),
            end: selectedEvent.end ? formatForInput(selectedEvent.end) : '',
            noteIds: selectedEvent.noteIds || []
        });

        setEditingEventId(selectedEvent.id);
        setDetailOpen(false);
        setOpenForm(true);
    };

    // --- Zapisywanie ---
    const handleSave = async () => {
        if (!formData.title) return showSnackbar('Wpisz tytuł wydarzenia!', 'error');
        if (!formData.start) return showSnackbar('Wybierz datę rozpoczęcia!', 'error');

        try {
            const body = {
                title: formData.title,
                description: formData.description,
                start: formData.start + ':00',
                end: formData.end ? formData.end + ':00' : null,
                noteIds: formData.noteIds
            };

            if (editingEventId) {
                await apiFetch(`/api/events/${editingEventId}`, { method: 'PUT', body: JSON.stringify(body) });
                showSnackbar('Zadanie zaktualizowane!', 'success');
            } else {
                await apiFetch('/api/events', { method: 'POST', body: JSON.stringify(body) });
                showSnackbar('Zadanie utworzone!', 'success');
            }

            setOpenForm(false);
            setEditingEventId(null);
            fetchData();
        } catch (e) {
            console.error(e);
            showSnackbar('Błąd zapisu.', 'error');
        }
    };

    // --- Kliknięcie w wydarzenie (podgląd) ---
    const handleEventClick = (clickInfo: any) => {
        const evt = clickInfo.event;
        setSelectedEvent({
            id: evt.id,
            title: evt.title,
            start: evt.startStr,
            end: evt.endStr,
            description: evt.extendedProps.description,
            noteIds: evt.extendedProps.noteIds || []
        });
        setDetailOpen(true);
    };

    // --- Drag & Drop ---
    const handleEventDrop = async (dropInfo: any) => {
        const evt = dropInfo.event;
        try {
            await apiFetch(`/api/events/${evt.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ start: evt.startStr, end: evt.endStr })
            });
            showSnackbar('Termin zaktualizowany.', 'success');
        } catch (e) {
            dropInfo.revert();
            showSnackbar('Nie udało się zmienić terminu.', 'error');
        }
    };

    // --- Usuwanie ---
    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm('Czy usunąć to zadanie?')) return;
        try {
            await apiFetch(`/api/events/${selectedEvent.id}`, { method: 'DELETE' });
            setDetailOpen(false);
            showSnackbar('Usunięto.', 'success');
            fetchData();
        } catch (e) {
            showSnackbar('Błąd usuwania.', 'error');
        }
    };

    const getNoteDetails = (id: string) => {
        return allNotes.find(n => n.id === id);
    };

    // Helper do ikon źródła
    const getSourceIcon = (type: string) => {
        if (type === 'GROUP') return <GroupIcon fontSize="small" />;
        if (type === 'SHARED') return <ShareIcon fontSize="small" />;
        return <DescriptionIcon fontSize="small" />;
    };

    return (
        <>
            <Head><title>Terminarz — NoteUZ</title></Head>
            <NotesLayout title="Terminarz Zadań">
                <Paper sx={{
                    p: 3,
                    borderRadius: '24px',
                    height: '82vh',
                    boxShadow: theme.shadows[2],
                    border: `1px solid ${theme.palette.divider}`,
                    '& .fc': { fontFamily: theme.typography.fontFamily },
                    '& .fc-button': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: '12px !important' },
                    '& .fc-button-active': { backgroundColor: `${theme.palette.primary.main} !important`, color: '#fff !important', borderColor: 'transparent !important' },
                    '& .fc-event': { cursor: 'pointer', borderRadius: '8px', border: 'none', boxShadow: theme.shadows[1] }
                }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek'
                        }}
                        initialView="dayGridMonth"
                        locale={plLocale}
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        events={events}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        height="100%"
                    />
                </Paper>

                {/* MODAL FORMULARZA */}
                <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ fontWeight: 700, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <EventIcon color="primary" />
                        {editingEventId ? 'Edytuj Zadanie' : 'Nowe Zadanie'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                            <TextField
                                autoFocus label="Tytuł zadania" fullWidth variant="filled"
                                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                InputProps={{ disableUnderline: true, sx: { borderRadius: 3 } }}
                            />

                            {/* SELEKCJA NOTATEK (WSZYSTKIE TYPY) */}
                            <FormControl fullWidth variant="filled">
                                <InputLabel>Powiąż notatki (Prywatne, Grupowe, Udostępnione)</InputLabel>
                                <Select
                                    multiple
                                    value={formData.noteIds}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setFormData({
                                            ...formData,
                                            noteIds: typeof value === 'string' ? value.split(',') : value,
                                        });
                                    }}
                                    disableUnderline
                                    sx={{ borderRadius: 3 }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const note = getNoteDetails(value);
                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={note ? note.title : 'Nieznana'}
                                                        size="small"
                                                        icon={note ? getSourceIcon(note.sourceType) : undefined}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {allNotes.map((note) => (
                                        <MenuItem key={note.id} value={note.id}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Typography variant="body2">{note.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {getSourceIcon(note.sourceType)}
                                                    {note.sourceLabel}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Opis" fullWidth multiline rows={2} variant="filled"
                                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                InputProps={{ disableUnderline: true, sx: { borderRadius: 3 } }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Początek" type="datetime-local" fullWidth variant="filled" InputLabelProps={{ shrink: true }}
                                    value={formData.start}
                                    onChange={(e) => {
                                        const newStart = e.target.value;
                                        setFormData(prev => {
                                            let newEnd = prev.end;
                                            if (newStart && prev.end) {
                                                if (new Date(prev.end) <= new Date(newStart)) {
                                                    const autoEnd = new Date(new Date(newStart).getTime() + 60*60000);
                                                    const offset = autoEnd.getTimezoneOffset() * 60000;
                                                    newEnd = new Date(autoEnd.getTime() - offset).toISOString().slice(0, 16);
                                                }
                                            }
                                            return { ...prev, start: newStart, end: newEnd };
                                        });
                                    }}
                                    InputProps={{ disableUnderline: true, sx: { borderRadius: 3 } }}
                                />
                                <TextField
                                    label="Koniec" type="datetime-local" fullWidth variant="filled" InputLabelProps={{ shrink: true }}
                                    value={formData.end} onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                    InputProps={{ disableUnderline: true, sx: { borderRadius: 3 } }}
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={() => setOpenForm(false)} color="inherit" sx={{ borderRadius: 4 }}>Anuluj</Button>
                        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 4, px: 4 }}>
                            {editingEventId ? 'Zaktualizuj' : 'Zapisz'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* MODAL SZCZEGÓŁÓW */}
                <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    {selectedEvent && (
                        <>
                            <DialogTitle sx={{ fontWeight: 700 }}>{selectedEvent.title}</DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                                    {selectedEvent.noteIds && selectedEvent.noteIds.length > 0 && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Powiązane materiały:</Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {selectedEvent.noteIds.map((nId: string) => {
                                                    const note = getNoteDetails(nId);
                                                    return (
                                                        <Paper key={nId} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, borderColor: theme.palette.divider }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                {note ? getSourceIcon(note.sourceType) : <DescriptionIcon color="disabled" />}
                                                                <Box>
                                                                    <Typography variant="body2" fontWeight={600}>{note ? note.title : 'Brak dostępu / Usunięta'}</Typography>
                                                                    {note && <Typography variant="caption" color="text.secondary">{note.sourceLabel}</Typography>}
                                                                </Box>
                                                            </Box>
                                                            <Button size="small" endIcon={<OpenInNewIcon />} onClick={() => router.push(`/notes/${nId}`)} sx={{ borderRadius: 4 }}>
                                                                Otwórz
                                                            </Button>
                                                        </Paper>
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    {selectedEvent.description && (
                                        <DialogContentText sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                                            {selectedEvent.description}
                                        </DialogContentText>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        Termin: {new Date(selectedEvent.start).toLocaleString('pl-PL')}
                                        {selectedEvent.end && ` - ${new Date(selectedEvent.end).toLocaleTimeString('pl-PL')}`}
                                    </Typography>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                <Box>
                                    <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: 4, mr: 1 }}>Usuń</Button>
                                    <Button onClick={handleEditClick} color="primary" startIcon={<EditIcon />} sx={{ borderRadius: 4 }}>Edytuj</Button>
                                </Box>
                                <Button onClick={() => setDetailOpen(false)} variant="tonal" color="inherit" sx={{ borderRadius: 4 }}>Zamknij</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                <Snackbar
                    open={snackbar.open} autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </NotesLayout>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) },
});