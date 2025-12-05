package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.NoteService;
import org.example.noteuzbackend.model.entity.Note;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService service;
    private final AuthService authService; // Potrzebny do sprawdzania tokena
    private final String cookieName;       // Nazwa ciasteczka z konfiguracji

    public NoteController(NoteService service,
                          AuthService authService,
                          @Value("${app.jwt.cookie}") String cookieName) {
        this.service = service;
        this.authService = authService;
        this.cookieName = cookieName;
    }

    // Metoda pomocnicza do wyciągania ID użytkownika z tokena
    private UUID getUserIdFromToken(String token) {
        if (token == null || token.isBlank()) return null;

        // Pytamy Supabase o dane użytkownika na podstawie tokena
        ResponseEntity<?> response = authService.getUser(token);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            Map<?, ?> body = (Map<?, ?>) response.getBody();
            String idStr = (String) body.get("id");
            return UUID.fromString(idStr);
        }
        return null;
    }

    // GET /api/notes - Teraz pobiera tylko notatki zalogowanego usera
    @GetMapping
    public ResponseEntity<?> list(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        }
        return ResponseEntity.ok(service.listNotes(userId));
    }

    // GET /api/notes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id,
                                 @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);
        // Opcjonalne zabezpieczenie: sprawdź czy notatka należy do usera
        if (!note.getUser_id().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu do tej notatki"));
        }
        return ResponseEntity.ok(note);
    }

    // POST /api/notes
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        }

        var title = String.valueOf(body.getOrDefault("title", ""));
        var content = String.valueOf(body.getOrDefault("content", ""));

        // Używamy prawdziwego ID zamiast placeholdera
        var saved = service.create(userId, title, content);

        return ResponseEntity.ok(saved);
    }

    // PUT /api/notes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                    @RequestBody Map<String, Object> body,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        // Sprawdzenie uprawnień przed edycją
        Note existing = service.getNoteById(id);
        if (!existing.getUser_id().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "To nie Twoja notatka"));
        }

        var title = String.valueOf(body.getOrDefault("title", ""));
        var content = String.valueOf(body.getOrDefault("content", ""));

        return ResponseEntity.ok(service.update(id, title, content));
    }

    // DELETE /api/notes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        // Sprawdzenie uprawnień przed usunięciem
        Note existing = service.getNoteById(id);
        if (!existing.getUser_id().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "To nie Twoja notatka"));
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}