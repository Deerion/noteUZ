package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.NoteService;
import org.example.noteuzbackend.service.EmailService;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteShare;
import org.example.noteuzbackend.repository.GroupMemberRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService service;
    private final AuthService authService;
    private final EmailService emailService;
    private final GroupMemberRepo groupMemberRepo;

    public NoteController(NoteService service, AuthService authService, EmailService emailService, GroupMemberRepo groupMemberRepo) {
        this.service = service;
        this.authService = authService;
        this.emailService = emailService;
        this.groupMemberRepo = groupMemberRepo;
    }

    @SuppressWarnings("unchecked")
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

    private String getUserEmailFromToken(String token) {
        Map<String, Object> userData = getUserDataFromToken(token);
        return (userData != null) ? (String) userData.get("email") : null;
    }

    @GetMapping
    public ResponseEntity<?> list(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        return ResponseEntity.ok(service.listNotes(userId));
    }

    @GetMapping("/shared")
    public ResponseEntity<?> listSharedNotes(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        String email = getUserEmailFromToken(token);
        if (email == null) return ResponseEntity.status(401).body(Map.of("message", "Musisz być zalogowany"));
        return ResponseEntity.ok(service.getSharedNotes(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        String userEmail = getUserEmailFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);
        String permission = null; // Domyślnie brak dostępu

        // 1. Sprawdzenie właściciela
        if (note.getUserId().equals(userId)) {
            permission = "OWNER";
        }

        // 2. Sprawdzenie grupy (Jeśli nie właściciel, ale jest w grupie -> ma WRITE)
        if (permission == null && note.getGroupId() != null) {
            if (groupMemberRepo.existsByGroupIdAndUserId(note.getGroupId(), userId)) {
                permission = "WRITE"; // TU BYŁ BŁĄD: Zmieniono na WRITE, aby frontend pozwolił na edycję
            }
        }

        // 3. Sprawdzenie udostępnienia (Share)
        // Logika: Jeśli permission to nadal null LUB permission to READ, sprawdzamy czy share nie daje wyższego uprawnienia
        if (!"OWNER".equals(permission) && !"WRITE".equals(permission)) {
            var shareOpt = service.findShare(id, userEmail);
            if (shareOpt.isPresent() && shareOpt.get().getStatus() == NoteShare.ShareStatus.ACCEPTED) {
                String sharePerm = shareOpt.get().getPermission().toString();
                // Jeśli jeszcze nie mamy żadnego uprawnienia, bierzemy to z share
                if (permission == null) {
                    permission = sharePerm;
                }
                // Jeśli mamy READ (np. z innej logiki), a share daje WRITE, podnosimy uprawnienie
                else if ("READ".equals(permission) && "WRITE".equals(sharePerm)) {
                    permission = "WRITE";
                }
            }
        }

        // Jeśli po wszystkich sprawdzeniach nadal null -> 403 Forbidden
        if (permission == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(Map.of(
                "id", note.getId(),
                "title", note.getTitle(),
                "content", note.getContent(),
                "userId", note.getUserId(),
                "groupId", note.getGroupId() != null ? note.getGroupId() : "null",
                "createdAt", note.getCreatedAt(),
                "permission", permission
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        var saved = service.create(userId, (String) body.get("title"), (String) body.get("content"));
        return ResponseEntity.ok(Map.of("id", saved.getId(), "title", saved.getTitle()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Map<String, Object> body, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        String userEmail = getUserEmailFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        Note existing = service.getNoteById(id);
        boolean hasPermission = false;

        // 1. Właściciel
        if (existing.getUserId().equals(userId)) {
            hasPermission = true;
        }

        // 2. Członek Grupy -> ZAWSZE MA PRAWO EDYCJI
        if (!hasPermission && existing.getGroupId() != null) {
            if (groupMemberRepo.existsByGroupIdAndUserId(existing.getGroupId(), userId)) {
                hasPermission = true;
            }
        }

        // 3. Udostępnienie z prawem WRITE
        if (!hasPermission) {
            var shareOpt = service.findShare(id, userEmail);
            if (shareOpt.isPresent() && shareOpt.get().getPermission() == NoteShare.Permission.WRITE) {
                hasPermission = true;
            }
        }

        if (!hasPermission) {
            return ResponseEntity.status(403).body(Map.of("message", "Brak uprawnień do edycji"));
        }

        var updated = service.update(id, (String) body.get("title"), (String) body.get("content"));
        return ResponseEntity.ok(Map.of("id", updated.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        String userEmail = getUserEmailFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);

        if (note.getUserId().equals(userId)) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            Optional<NoteShare> share = service.findShare(id, userEmail);
            if (share.isPresent()) {
                service.revokeShare(share.get().getId());
                return ResponseEntity.ok(Map.of("message", "Usunięto notatkę z listy udostępnionych"));
            }
            return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu"));
        }
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareNote(@PathVariable UUID id, @RequestBody Map<String, String> body, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID ownerId = getUserIdFromToken(token);
        String ownerEmail = getUserEmailFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);
        if (!note.getUserId().equals(ownerId)) return ResponseEntity.status(403).body(Map.of("message", "Tylko właściciel może udostępniać"));

        String recipientEmail = body.get("email");
        String permissionStr = body.getOrDefault("permission", "READ");
        NoteShare.Permission permission = NoteShare.Permission.valueOf(permissionStr);

        try {
            String shareUrl = service.createShare(id, ownerId, recipientEmail, permission);

            try {
                emailService.sendShareInvitation(recipientEmail, ownerEmail, note.getTitle(), shareUrl, permissionStr);
            } catch (Exception e) {
                System.err.println("Błąd wysyłania maila: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of("message", "Wysłano", "shareUrl", shareUrl));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/shares")
    public ResponseEntity<?> getNoteShares(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        Note note = service.getNoteById(id);
        if (!note.getUserId().equals(userId)) return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu"));
        return ResponseEntity.ok(service.getNoteShares(id));
    }

    @PostMapping("/share/{token}/accept")
    public ResponseEntity<?> acceptShare(@PathVariable String token, @CookieValue(value = "${app.jwt.cookie}", required = false) String sessionToken) {
        UUID userId = getUserIdFromToken(sessionToken);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Zaloguj się"));

        try {
            service.acceptShare(UUID.fromString(token), userId);
            return ResponseEntity.ok(Map.of("message", "Zaakceptowano"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/share/{shareId}")
    public ResponseEntity<?> updateShare(@PathVariable UUID shareId, @RequestBody Map<String, String> body, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getUserIdFromToken(token) == null) return ResponseEntity.status(401).build();

        service.updateSharePermission(shareId, NoteShare.Permission.valueOf(body.get("permission")));
        return ResponseEntity.ok(Map.of("message", "Zaktualizowano"));
    }

    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<?> revokeShare(@PathVariable UUID shareId, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getUserIdFromToken(token) == null) return ResponseEntity.status(401).build();

        service.revokeShare(shareId);
        return ResponseEntity.ok(Map.of("message", "Usunięto"));
    }
}