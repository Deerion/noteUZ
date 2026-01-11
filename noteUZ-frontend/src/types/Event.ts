export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    noteId?: string; // <-- Dodaj to
}