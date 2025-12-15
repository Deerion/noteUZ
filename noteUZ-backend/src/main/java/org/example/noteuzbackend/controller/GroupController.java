package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.GroupService;
import org.example.noteuzbackend.service.NoteService; // <--- 1. IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final AuthService authService;
    private final NoteService noteService; // <--- 2. NOWE POLE

    // <--- 3. ZAKTUALIZOWANY KONSTRUKTOR
    public GroupController(GroupService groupService, AuthService authService, NoteService noteService) {
        this.groupService = groupService;
        this.authService = authService;
        this.noteService = noteService;
    }

    private UUID getUserIdFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        ResponseEntity<?> response = authService.getUser(token);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            Map<?, ?> body = (Map<?, ?>) response.getBody();
            String idStr = (String) body.get("id");
            return UUID.fromString(idStr);
        }
        return null;
    }

    // 1. GET /api/groups - Lista grup
    @GetMapping
    public ResponseEntity<?> listMyGroups(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }

    // 2. GET /api/groups/{id} - Szczegóły
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupDetails(@PathVariable UUID id,
                                             @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(groupService.getGroupDetails(id, userId));
    }

    // 3. POST /api/groups - Utwórz grupę
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, String> body,
                                         @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        String name = body.getOrDefault("name", "Nowa Grupa");
        String description = body.getOrDefault("description", "");

        return ResponseEntity.ok(groupService.createGroup(userId, name, description));
    }

    // 4. POST /api/groups/{id}/members - Zaproś członka
    @PostMapping("/{id}/members")
    public ResponseEntity<?> inviteMember(@PathVariable UUID id,
                                          @RequestBody Map<String, String> body,
                                          @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        String targetEmail = body.get("email");
        if (targetEmail == null || targetEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Wymagany jest email"));
        }

        groupService.inviteUserByEmail(id, userId, targetEmail);
        return ResponseEntity.ok().build();
    }

    // 5. GET /api/groups/invitations - Moje zaproszenia
    @GetMapping("/invitations")
    public ResponseEntity<?> getMyInvitations(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(groupService.getUserInvitations(userId));
    }

    // 6. POST /api/groups/invitations/{invitationId} - Odpowiedz
    @PostMapping("/invitations/{invitationId}")
    public ResponseEntity<?> respondInvitation(@PathVariable UUID invitationId,
                                               @RequestBody Map<String, Boolean> body,
                                               @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        boolean accept = body.getOrDefault("accept", false);
        groupService.respondToInvitation(invitationId, userId, accept);

        return ResponseEntity.ok().build();
    }

    // 7. DELETE /api/groups/{id}/members/{targetUserId}
    @DeleteMapping("/{id}/members/{targetUserId}")
    public ResponseEntity<?> removeMember(@PathVariable UUID id,
                                          @PathVariable UUID targetUserId,
                                          @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        groupService.removeMember(id, userId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    // 8. PATCH /api/groups/{id}/members/{targetUserId}
    @PatchMapping("/{id}/members/{targetUserId}")
    public ResponseEntity<?> changeRole(@PathVariable UUID id,
                                        @PathVariable UUID targetUserId,
                                        @RequestBody Map<String, String> body,
                                        @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        String newRole = body.get("role");
        if (newRole == null) return ResponseEntity.badRequest().body("Brak roli");

        groupService.changeRole(id, userId, targetUserId, newRole);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // NOWE ENDPOINTY DLA NOTATEK GRUPOWYCH
    // ==========================================

    // 9. GET /api/groups/{id}/notes - Pobierz notatki grupy
    @GetMapping("/{id}/notes")
    public ResponseEntity<?> getGroupNotes(@PathVariable UUID id,
                                           @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        // Używamy NoteService, który już ma gotową metodę listGroupNotes
        return ResponseEntity.ok(noteService.listGroupNotes(id));
    }

    // 10. POST /api/groups/{id}/notes - Utwórz notatkę w grupie
    @PostMapping("/{id}/notes")
    public ResponseEntity<?> createGroupNote(@PathVariable UUID id,
                                             @RequestBody Map<String, String> body,
                                             @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        String title = body.getOrDefault("title", "");
        String content = body.getOrDefault("content", "");

        // Używamy NoteService do utworzenia notatki przypisanej do grupy
        return ResponseEntity.ok(noteService.createGroupNote(id, userId, title, content));
    }
}