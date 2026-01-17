import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSideProps } from 'next';
import {
    Box, Paper, Dialog, DialogTitle, DialogContent, TextField,
    DialogActions, Button, useTheme, DialogContentText, Snackbar, Alert,
    MenuItem, FormControl, InputLabel, Select, Chip, Typography,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';

// FullCalendar imports & Types
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core'; // <--- TYPY DLA KALENDARZA

import { NotesLayout } from '@/components/NotesPage/NotesLayout';
import { apiFetch } from '@/lib/api';
import { CalendarEvent } from '@/types/Event';
import { Note } from '@/types/Note';
// USUNIĘTO import Group, zdefiniujemy go lokalnie, aby uniknąć błędu TS2305

// Definicja lokalna Group, żeby naprawić błąd importu
interface Group {
    id: string;
    name: string;
}

// Rozszerzony typ notatki
interface NoteWithSource extends Note {
    sourceLabel?: string;
    sourceType: 'PRIVATE' | 'GROUP' | 'SHARED';
}

// Typ stanu wybranego wydarzenia (dla bezpieczeństwa TS)
interface SelectedEventState {
    id: string;
    title: string;
    start: string;
    end?: string;
    description?: string;
    noteIds: string[];
}

export default function CalendarPage() {
    const { t } = useTranslation('common'); // eslint-disable-line @typescript-eslint/no-unused-vars
    const theme = useTheme();
    const router = useRouter();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [allNotes, setAllNotes] = useState<NoteWithSource[]>([]);
    const [loading, setLoading] = useState(true);

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
    const [selectedEvent, setSelectedEvent] = useState<SelectedEventState | null>(null);

    // --- 1. ULEPSZONE POBIERANIE DANYCH ---
// --- 1. ULEPSZONE POBIERANIE DANYCH (POPRAWKA MAPOWANIA GRUP) ---
    const fetchData = async () => {
        setLoading(true);
        try {
            let eventsData: CalendarEvent[] = [];
            let privateNotes: Note[] = [];
            let sharedNotes: Note[] = [];
            let groupsRaw: any[] = []; // Używamy any[], bo backend zwraca groupId zamiast id

            // 1. Pobieranie Wydarzeń
            try {
                eventsData = await apiFetch<CalendarEvent[]>('/api/events');
            } catch (e) { console.error("Błąd pobierania wydarzeń", e); }

            // 2. Pobieranie Notatek Prywatnych
            try {
                privateNotes = await apiFetch<Note[]>('/api/notes');
            } catch (e) { console.error("Błąd pobierania notatek", e); }

            // 3. Pobieranie Notatek Udostępnionych
            try {
                sharedNotes = await apiFetch<Note[]>('/api/notes/shared');
            } catch (e) { console.error("Błąd pobierania udostępnionych", e); }

            // 4. Pobieranie Grup (i naprawa struktury danych)
            let groupsData: Group[] = [];
            try {
                groupsRaw = await apiFetch<any[]>('/api/groups');
                // MAPOWANIE: Backend zwraca { groupId, groupName }, a my chcemy { id, name }
                groupsData = groupsRaw.map(g => ({
                    id: g.groupId,      // <--- KLUCZOWA POPRAWKA
                    name: g.groupName
                }));
            } catch (e) { console.error("Błąd pobierania grup", e); }

            // 5. Pobieranie notatek dla każdej grupy
            const groupNotesPromises = groupsData.map(group =>
                apiFetch<Note[]>(`/api/groups/${group.id}/notes`)
                    .then(notes => notes.map(n => ({
                        ...n,
                        sourceLabel: `Grupa: ${group.name}`,
                        sourceType: 'GROUP' as const
                    })))
                    .catch(err => {
                        console.warn(`Nie udało się pobrać notatek dla grupy ${group.name}`, err);
                        return [];
                    })
            );

            const groupNotesResults = await Promise.all(groupNotesPromises);
            const allGroupNotes = groupNotesResults.flat();

            // 6. Formatowanie pozostałych notatek
            const formattedPrivateNotes = privateNotes.map(n => ({
                ...n,
                sourceLabel: 'Prywatna',
                sourceType: 'PRIVATE' as const
            }));

            const formattedSharedNotes = sharedNotes.map(n => ({
                ...n,
                sourceLabel: 'Udostępniona',
                sourceType: 'SHARED' as const
            }));

            // 7. Zapis do stanu
            setEvents(eventsData);
            setAllNotes([...formattedPrivateNotes, ...formattedSharedNotes, ...allGroupNotes]);

        } catch (e) {
            console.error("Krytyczny błąd pobierania danych:", e);
            showSnackbar('Wystąpił błąd podczas ładowania danych.', 'error');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // --- FORMATOWANIE DATY ---
    const toInputFormat = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.substring(0, 16);
    };

    // --- SELECTION (Tworzenie nowego) - NAPRAWIONE TYPY ---
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        // Zmiana let na const (ESLint fix)
        const startStr = selectInfo.startStr;
        const endStr = selectInfo.endStr;

        const finalStart = selectInfo.allDay ? `${startStr}T09:00` : startStr;

        let finalEnd = '';
        if (selectInfo.allDay) {
            finalEnd = `${startStr}T10:00`;
        } else {
            finalEnd = endStr;
        }

        setEditingEventId(null);
        setFormData({
            title: '',
            description: '',
            start: toInputFormat(finalStart),
            end: toInputFormat(finalEnd),
            noteIds: []
        });
        setOpenForm(true);
    };

    // --- EDYCJA (Otwarcie formularza) ---
    const handleEditClick = () => {
        if (!selectedEvent) return;

        setFormData({
            title: selectedEvent.title,
            description: selectedEvent.description || '',
            start: toInputFormat(selectedEvent.start),
            end: selectedEvent.end ? toInputFormat(selectedEvent.end) : '',
            noteIds: selectedEvent.noteIds || []
        });

        setEditingEventId(selectedEvent.id);
        setDetailOpen(false);
        setOpenForm(true);
    };

    // --- ZAPIS (Create/Update) ---
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
            showSnackbar('Błąd zapisu. Spróbuj ponownie.', 'error');
        }
    };

    // --- KLIKNIĘCIE W WYDARZENIE (Szczegóły) - NAPRAWIONE TYPY ---
    const handleEventClick = (clickInfo: EventClickArg) => {
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

    // --- DRAG & DROP - NAPRAWIONE TYPY ---
    const handleEventDrop = async (dropInfo: EventDropArg) => {
        const evt = dropInfo.event;
        try {
            await apiFetch(`/api/events/${evt.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    start: evt.startStr,
                    end: evt.endStr
                })
            });
            showSnackbar('Termin zaktualizowany.', 'success');
        } catch (e) {
            dropInfo.revert();
            showSnackbar('Nie udało się zmienić terminu.', 'error');
        }
    };

    // --- USUWANIE ---
    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm('Czy na pewno usunąć to zadanie?')) return;
        try {
            await apiFetch(`/api/events/${selectedEvent.id}`, { method: 'DELETE' });
            setDetailOpen(false);
            showSnackbar('Usunięto zadanie.', 'success');
            fetchData();
        } catch (e) {
            showSnackbar('Błąd usuwania.', 'error');
        }
    };

    const getNoteDetails = (id: string) => {
        return allNotes.find(n => n.id === id);
    };

    const getSourceIcon = (type: string) => {
        if (type === 'GROUP') return <GroupIcon fontSize="small" color="primary" />;
        if (type === 'SHARED') return <ShareIcon fontSize="small" color="secondary" />;
        return <DescriptionIcon fontSize="small" color="action" />;
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
                    position: 'relative',
                    '& .fc': { fontFamily: theme.typography.fontFamily },
                    '& .fc-button': { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: '12px !important' },
                    '& .fc-button-active': { backgroundColor: `${theme.palette.primary.main} !important`, color: '#fff !important', borderColor: 'transparent !important' },
                    '& .fc-event': { cursor: 'pointer', borderRadius: '6px', border: 'none', boxShadow: theme.shadows[1] }
                }}>
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // ZMIANA: Tło zależne od motywu, a nie sztywna biel
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                            zIndex: 10,
                            borderRadius: '24px' // Dopasowanie do zaokrąglenia Paper
                        }}>
                            <CircularProgress />
                        </Box>
                    )}
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

                {/* --- FORMULARZ --- */}
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

                            <FormControl fullWidth variant="filled">
                                <InputLabel>Powiąż notatki</InputLabel>
                                <Select
                                    multiple
                                    value={formData.noteIds}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setFormData({
                                            ...formData,
                                            noteIds: typeof value === 'string' ? value.split(',') : value as string[],
                                        });
                                    }}
                                    disableUnderline
                                    sx={{ borderRadius: 3 }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const note = getNoteDetails(value);
                                                if (!note) return <Chip key={value} label="Nieznana notatka" size="small" />;

                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={note.title}
                                                        size="small"
                                                        icon={getSourceIcon(note.sourceType)}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {allNotes.length > 0 ? allNotes.map((note) => (
                                        <MenuItem key={note.id} value={note.id}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Typography variant="body2">{note.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {getSourceIcon(note.sourceType)}
                                                    {note.sourceLabel}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    )) : (
                                        <MenuItem disabled>Brak dostępnych notatek</MenuItem>
                                    )}
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
                                            if (newStart && (!prev.end || new Date(prev.end) <= new Date(newStart))) {
                                                const d = new Date(newStart);
                                                d.setHours(d.getHours() + 1);
                                                const yyyy = d.getFullYear();
                                                const MM = String(d.getMonth() + 1).padStart(2, '0');
                                                const dd = String(d.getDate()).padStart(2, '0');
                                                const hh = String(d.getHours()).padStart(2, '0');
                                                const mm = String(d.getMinutes()).padStart(2, '0');
                                                newEnd = `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
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

                {/* --- SZCZEGÓŁY --- */}
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
                                                {selectedEvent.noteIds.map((nId) => {
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
                                        <DialogContentText sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                                            {selectedEvent.description}
                                        </DialogContentText>
                                    )}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        <EventIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                        Start: {new Date(selectedEvent.start).toLocaleString('pl-PL')} <br/>
                                        {selectedEvent.end && `Koniec: ${new Date(selectedEvent.end).toLocaleString('pl-PL')}`}
                                    </Typography>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                                <Box>
                                    <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: 4, mr: 1 }}>Usuń</Button>
                                    <Button onClick={handleEditClick} color="primary" startIcon={<EditIcon />} sx={{ borderRadius: 4 }}>Edytuj</Button>
                                </Box>
                                {/* ZMIANA: tonal -> outlined */}
                                <Button onClick={() => setDetailOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 4 }}>Zamknij</Button>
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