package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.NoteService;
import org.example.noteuzbackend.service.EmailService;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.GroupMemberRepo; // <--- 1. IMPORT
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService service;
    private final AuthService authService;
    private final EmailService emailService;
    private final GroupMemberRepo groupMemberRepo; // <--- 2. NOWE POLE
    private final String cookieName;

    // <--- 3. ZAKTUALIZOWANY KONSTRUKTOR
    public NoteController(NoteService service,
                          AuthService authService,
                          EmailService emailService,
                          GroupMemberRepo groupMemberRepo,
                          @Value("${app.jwt.cookie}") String cookieName) {
        this.service = service;
        this.authService = authService;
        this.emailService = emailService;
        this.groupMemberRepo = groupMemberRepo;
        this.cookieName = cookieName;
    }

    // Metoda pomocnicza do sprawdzania dostępu (Autor LUB Członek Grupy)
    private boolean hasAccess(Note note, UUID userId) {
        // 1. Jest autorem
        if (note.getUserId().equals(userId)) {
            return true;
        }
        // 2. Jest członkiem grupy przypisanej do notatki
        if (note.getGroupId() != null) {
            return groupMemberRepo.existsByGroupIdAndUserId(note.getGroupId(), userId);
        }
        return false;
    }

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

        // <--- 4. NOWE SPRAWDZANIE UPRAWNIEŃ (Wspiera Grupy)
        if (!hasAccess(note, userId)) {
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

        // <--- 5. EDYCJA DLA CZŁONKÓW GRUPY (Wspólna edycja)
        if (!hasAccess(existing, userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Brak uprawnień do edycji"));
        }

        var title = String.valueOf(body.getOrDefault("title", ""));
        var content = String.valueOf(body.getOrDefault("content", ""));

        return ResponseEntity.ok(service.update(id, title, content));
    }

    // DELETE /api/notes/{id}
// DELETE /api/notes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {

        // 1. Pobierz dane zalogowanego użytkownika
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        // 2. Pobierz notatkę
        Note existing = service.getNoteById(id);

        // 3. Sprawdź uprawnienia (AUTOR lub ADMIN/OWNER GRUPY)
        boolean isAuthor = existing.getUserId().equals(userId);
        boolean canDelete = isAuthor;

        // Jeśli nie jest autorem, sprawdzamy czy jest szefem grupy
        if (!isAuthor && existing.getGroupId() != null) {
            var memberOpt = groupMemberRepo.findByGroupIdAndUserId(existing.getGroupId(), userId);
            if (memberOpt.isPresent()) {
                var role = memberOpt.get().getRole();
                // Admin i Owner mogą usuwać notatki innych
                if (role.name().equals("OWNER") || role.name().equals("ADMIN")) {
                    canDelete = true;
                }
            }
        }

        if (!canDelete) {
            return ResponseEntity.status(403).body(Map.of("message", "Brak uprawnień do usunięcia notatki"));
        }

        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    // POST /api/notes/{id}/email
    @PostMapping("/{id}/email")
    public ResponseEntity<?> sendEmail(@PathVariable UUID id,
                                       @RequestBody Map<String, String> body,
                                       @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {

        Map<String, Object> userData = getUserDataFromToken(token);
        if (userData == null) return ResponseEntity.status(401).build();

        UUID userId = UUID.fromString((String) userData.get("id"));
        String senderEmail = (String) userData.get("email");

        Note note = service.getNoteById(id);

        // <--- 7. WYSYŁANIE MAILA DLA CZŁONKÓW GRUPY
        if (!hasAccess(note, userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu do tej notatki"));
        }

        String targetEmail = body.get("email");
        if (targetEmail == null || !targetEmail.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nieprawidłowy adres e-mail"));
        }

        try {
            emailService.sendNote(targetEmail, note.getTitle(), note.getContent(), senderEmail);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Błąd wysyłania e-maila: " + e.getMessage()));
        }
    }
}