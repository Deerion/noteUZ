package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Event;
import org.example.noteuzbackend.repository.EventRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class EventService {
    private final EventRepo eventRepo;

    public EventService(EventRepo eventRepo) {
        this.eventRepo = eventRepo;
    }

    /**
     * Pobiera listę wydarzeń przypisanych do konkretnego użytkownika, posortowaną chronologicznie.
     * @param userId identyfikator użytkownika
     * @return lista wydarzeń
     */
    public List<Event> getUserEvents(UUID userId) {
        return eventRepo.findByUserIdOrderByStartAsc(userId);
    }

    /**
     * Tworzy i zapisuje nowe wydarzenie w systemie.
     * @param event obiekt wydarzenia do zapisania
     * @return zapisane wydarzenie
     */
    @Transactional
    public Event createEvent(Event event) {
        return eventRepo.save(event);
    }

    /**
     * Usuwa wydarzenie o podanym identyfikatorze, o ile należy ono do wskazanego użytkownika.
     * @param eventId identyfikator wydarzenia
     * @param userId identyfikator użytkownika próbującego usunąć wydarzenie
     */
    @Transactional
    public void deleteEvent(UUID eventId, UUID userId) {
        // Sprawdź czy wydarzenie należy do użytkownika przed usunięciem
        eventRepo.findById(eventId).ifPresent(event -> {
            if (event.getUserId().equals(userId)) {
                eventRepo.delete(event);
            }
        });
    }
}