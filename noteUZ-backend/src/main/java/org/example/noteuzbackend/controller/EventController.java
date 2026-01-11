package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.model.entity.Event;
import org.example.noteuzbackend.repository.EventRepo;
import org.example.noteuzbackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepo eventRepo;
    private final AuthService authService;

    public EventController(EventRepo eventRepo, AuthService authService) {
        this.eventRepo = eventRepo;
        this.authService = authService;
    }

    // Helper do wyciągania ID usera z ciasteczka
    private UUID getUserIdFromToken(String token) {
        if (token == null) return null;
        var response = authService.getUser(token);
        if (!response.getStatusCode().is2xxSuccessful()) return null;
        Map body = (Map) response.getBody();
        return UUID.fromString((String) body.get("id"));
    }

    @GetMapping
    public ResponseEntity<?> getMyEvents(@CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(eventRepo.findByUserIdOrderByStartAsc(userId));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event,
                                         @CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        // 1. Walidacja: Data startu jest wymagana
        if (event.getStart() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Data rozpoczęcia jest wymagana!"));
        }

        event.setUserId(userId);

        // 2. Bezpieczne ustawianie daty końcowej (domyślnie +1h)
        if (event.getEnd() == null) {
            event.setEnd(event.getStart().plusHours(1));
        }

        // 3. Walidacja: Koniec nie może być przed startem
        if (event.getEnd().isBefore(event.getStart())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia."));
        }

        return ResponseEntity.ok(eventRepo.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable UUID id,
                                         @CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        eventRepo.findById(id).ifPresent(event -> {
            if (event.getUserId().equals(userId)) {
                eventRepo.delete(event);
            }
        });
        return ResponseEntity.ok().build();
    }

    // PATCH: Dla Drag & Drop (aktualizacja tylko dat)
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateEventDates(@PathVariable UUID id,
                                              @RequestBody Map<String, Object> updates,
                                              @CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
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

            // Automatyczna naprawa daty końca przy przesuwaniu (UX)
            if (event.getEnd() == null || event.getEnd().isBefore(event.getStart())) {
                event.setEnd(event.getStart().plusHours(1));
            }

            return ResponseEntity.ok(eventRepo.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT: Dla edycji w modalu (pełna aktualizacja)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEventFull(@PathVariable UUID id,
                                             @RequestBody Event updatedEvent,
                                             @CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return eventRepo.findById(id).map(event -> {
            if (!event.getUserId().equals(userId)) return ResponseEntity.status(403).build();

            // Aktualizacja pól
            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setStart(updatedEvent.getStart());

            // Walidacja dat
            if (updatedEvent.getEnd() == null) {
                event.setEnd(event.getStart().plusHours(1));
            } else {
                event.setEnd(updatedEvent.getEnd());
            }

            if (event.getEnd().isBefore(event.getStart())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Data zakończenia nie może być wcześniejsza niż start."));
            }

            // Aktualizacja powiązanych notatek
            if (updatedEvent.getNoteIds() != null) {
                event.setNoteIds(updatedEvent.getNoteIds());
            }

            return ResponseEntity.ok(eventRepo.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }
}