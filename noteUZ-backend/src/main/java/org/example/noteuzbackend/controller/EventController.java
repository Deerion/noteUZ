package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.model.entity.Event;
import org.example.noteuzbackend.repository.EventRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje na wydarzeniach kalendarza.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepo eventRepo;

    /**
     * Konstruktor kontrolera wydarzeń.
     * @param eventRepo Repozytorium wydarzeń.
     */
    public EventController(EventRepo eventRepo) {
        this.eventRepo = eventRepo;
    }

    /**
     * Pobiera listę wszystkich wydarzeń zalogowanego użytkownika.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą wydarzeń posortowaną chronologicznie.
     */
    @GetMapping
    public ResponseEntity<?> getMyEvents(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(eventRepo.findByUserIdOrderByStartAsc(userId));
    }

    /**
     * Tworzy nowe wydarzenie.
     * @param event Dane nowego wydarzenia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z zapisanym wydarzeniem lub komunikatem o błędzie.
     */
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        if (event.getStart() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Data rozpoczęcia jest wymagana!"));
        }

        event.setUserId(userId);

        // Domyślna długość 1h
        if (event.getEnd() == null) {
            event.setEnd(event.getStart().plusHours(1));
        }

        if (event.getEnd().isBefore(event.getStart())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Koniec nie może być przed startem."));
        }

        return ResponseEntity.ok(eventRepo.save(event));
    }

    /**
     * Usuwa wydarzenie o podanym identyfikatorze.
     * @param id Identyfikator wydarzenia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z potwierdzeniem operacji.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        eventRepo.findById(id).ifPresent(event -> {
            if (event.getUserId().equals(userId)) {
                eventRepo.delete(event);
            }
        });
        return ResponseEntity.ok().build();
    }

    /**
     * Aktualizuje daty wydarzenia (np. po przeciągnięciu w kalendarzu).
     * @param id Identyfikator wydarzenia.
     * @param updates Mapa zawierająca zaktualizowane pola (start, end).
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z zaktualizowanym wydarzeniem.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateEventDates(@PathVariable UUID id,
                                              @RequestBody Map<String, Object> updates,
                                              @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        return eventRepo.findById(id).map(event -> {
            if (!event.getUserId().equals(userId)) return ResponseEntity.status(403).build();

            if (updates.containsKey("start")) {
                event.setStart(LocalDateTime.parse((String) updates.get("start")));
            }
            if (updates.containsKey("end")) {
                String endStr = (String) updates.get("end");
                event.setEnd(endStr != null ? LocalDateTime.parse(endStr) : null);
            }

            if (event.getEnd() == null || event.getEnd().isBefore(event.getStart())) {
                event.setEnd(event.getStart().plusHours(1));
            }

            return ResponseEntity.ok(eventRepo.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Pełna aktualizacja danych wydarzenia.
     * @param id Identyfikator wydarzenia.
     * @param updatedEvent Nowe dane wydarzenia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z zaktualizowanym wydarzeniem.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEventFull(@PathVariable UUID id,
                                             @RequestBody Event updatedEvent,
                                             @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        return eventRepo.findById(id).map(event -> {
            if (!event.getUserId().equals(userId)) return ResponseEntity.status(403).build();

            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setStart(updatedEvent.getStart());

            if (updatedEvent.getEnd() == null) {
                event.setEnd(event.getStart().plusHours(1));
            } else {
                event.setEnd(updatedEvent.getEnd());
            }

            if (event.getEnd().isBefore(event.getStart())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Koniec nie może być przed startem."));
            }

            if (updatedEvent.getNoteIds() != null) {
                event.setNoteIds(updatedEvent.getNoteIds());
            }

            return ResponseEntity.ok(eventRepo.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }
}