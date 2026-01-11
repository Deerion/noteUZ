import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { apiFetch } from '@/lib/api';
import { CalendarEvent } from '@/types/Event';

export const UpcomingEventsSection = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        apiFetch<CalendarEvent[]>('/api/events').then(data => {
            // Filtrujemy tylko przyszłe wydarzenia i sortujemy
            const now = new Date();
            const futureEvents = data
                .filter(e => new Date(e.start) >= now)
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .slice(0, 3); // Bierzemy tylko 3 najbliższe
            setEvents(futureEvents);
        }).catch(() => {});
    }, []);

    if (events.length === 0) return null; // Nie pokazuj sekcji jak nie ma planów

    return (
        <Paper sx={{ p: 3, borderRadius: '24px', mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Nadchodzące terminy 📅
            </Typography>
            <List dense>
                {events.map(event => (
                    <ListItem key={event.id}>
                        <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                        <ListItemText
                            primary={event.title}
                            secondary={new Date(event.start).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};