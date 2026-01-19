package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.dto.GroupRequests.*;
import org.example.noteuzbackend.service.GroupService;
import org.example.noteuzbackend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final NoteService noteService;

    public GroupController(GroupService groupService, NoteService noteService) {
        this.groupService = groupService;
        this.noteService = noteService;
    }

    // 1. GET /api/groups - Lista grup
    @GetMapping
    public ResponseEntity<?> listMyGroups(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }

    // 2. GET /api/groups/{id} - Szczegóły
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupDetails(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getGroupDetails(id, userId));
    }

    // 3. POST /api/groups - Utwórz grupę
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        // Zabezpieczenie na wypadek nulli z frontu
        String name = body.name() != null ? body.name() : "Nowa Grupa";
        String desc = body.description() != null ? body.description() : "";

        return ResponseEntity.ok(groupService.createGroup(userId, name, desc));
    }

    // 4. POST /api/groups/{id}/members - Zaproś członka
    @PostMapping("/{id}/members")
    public ResponseEntity<?> inviteMember(@PathVariable UUID id, @RequestBody InviteMemberRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        if (body.email() == null || body.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Wymagany jest email"));
        }

        groupService.inviteUserByEmail(id, userId, body.email());
        return ResponseEntity.ok().build();
    }

    // 5. GET /api/groups/invitations - Moje zaproszenia
    @GetMapping("/invitations")
    public ResponseEntity<?> getMyInvitations(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getUserInvitations(userId));
    }

    // 6. POST /api/groups/invitations/{invitationId} - Odpowiedz
    @PostMapping("/invitations/{invitationId}")
    public ResponseEntity<?> respondInvitation(@PathVariable UUID invitationId,
                                               @RequestBody InvitationResponseRequest body,
                                               @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        boolean accept = body.accept() != null ? body.accept() : false;
        groupService.respondToInvitation(invitationId, userId, accept);

        return ResponseEntity.ok().build();
    }

    // 7. DELETE /api/groups/{id}/members/{targetUserId}
    @DeleteMapping("/{id}/members/{targetUserId}")
    public ResponseEntity<?> removeMember(@PathVariable UUID id, @PathVariable UUID targetUserId, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        groupService.removeMember(id, userId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    // 8. PATCH /api/groups/{id}/members/{targetUserId}
    @PatchMapping("/{id}/members/{targetUserId}")
    public ResponseEntity<?> changeRole(@PathVariable UUID id,
                                        @PathVariable UUID targetUserId,
                                        @RequestBody ChangeRoleRequest body,
                                        @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        if (body.role() == null) return ResponseEntity.badRequest().body("Brak roli");

        groupService.changeRole(id, userId, targetUserId, body.role());
        return ResponseEntity.ok().build();
    }

    // 9. GET /api/groups/{id}/notes
    @GetMapping("/{id}/notes")
    public ResponseEntity<?> getGroupNotes(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(noteService.listGroupNotes(id));
    }

    // 10. POST /api/groups/{id}/notes
    @PostMapping("/{id}/notes")
    public ResponseEntity<?> createGroupNote(@PathVariable UUID id,
                                             @RequestBody CreateGroupNoteRequest body,
                                             @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        String title = body.title() != null ? body.title() : "";
        String content = body.content() != null ? body.content() : "";

        return ResponseEntity.ok(noteService.createGroupNote(id, userId, title, content));
    }
}