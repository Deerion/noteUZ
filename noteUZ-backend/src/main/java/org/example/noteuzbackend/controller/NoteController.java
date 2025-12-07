package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.NoteService;
import org.example.noteuzbackend.service.EmailService;
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
    private final AuthService authService;
    private final EmailService emailService;
    private final String cookieName;

    public NoteController(NoteService service,
                          AuthService authService,
                          EmailService emailService,
                          @Value("${app.jwt.cookie}") String cookieName) {
        this.service = service;
        this.authService = authService;
        this.emailService = emailService;
        this.cookieName = cookieName;
    }

    // Metoda pomocnicza do wyciągania ID użytkownika z tokena
    private Map<String, Object> getUserDataFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        ResponseEntity<?> response = authService.getUser(token);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            return (Map<String, Object>) response.getBody();
        }
        return null;
    }

    private UUID getUserIdFromToken(String token) {
        Map<String, Object> userData = getUserDataFromToken(token);
        if (userData != null && userData.get("id") instanceof String) {
            return UUID.fromString((String) userData.get("id"));
        }
        return null;
    }

    // GET /api/notes
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

        Note existing = service.getNoteById(id);
        if (!existing.getUser_id().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "To nie Twoja notatka"));
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- NOWA METODA: WYSYŁANIE E-MAILEM (POPRAWIONA) ---
    @PostMapping("/{id}/email")
    public ResponseEntity<?> sendEmail(@PathVariable UUID id,
                                       @RequestBody Map<String, String> body,
                                       @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {

        // 1. Pobierz pełne dane zalogowanego użytkownika (nadawcy)
        Map<String, Object> userData = getUserDataFromToken(token);
        if (userData == null) return ResponseEntity.status(401).build();

        UUID userId = UUID.fromString((String) userData.get("id"));
        String senderEmail = (String) userData.get("email"); // E-mail nadawcy!

        // 2. Pobierz notatkę i sprawdź uprawnienia
        Note note = service.getNoteById(id);
        if (!note.getUser_id().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "To nie Twoja notatka"));
        }

        // 3. Pobierz email docelowy (adresata)
        String targetEmail = body.get("email");
        if (targetEmail == null || !targetEmail.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nieprawidłowy adres e-mail"));
        }

        // 4. Wyślij e-mail (przekazujemy e-mail nadawcy, aby wstawić go w treść)
        try {
            emailService.sendNote(targetEmail, note.getTitle(), note.getContent(), senderEmail);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Błąd wysyłania e-maila: " + e.getMessage()));
        }
    }
}