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

    public List<Event> getUserEvents(UUID userId) {
        return eventRepo.findByUserIdOrderByStartAsc(userId);
    }

    @Transactional
    public Event createEvent(Event event) {
        return eventRepo.save(event);
    }

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