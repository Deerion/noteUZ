package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.dto.GroupRequests.*;
import org.example.noteuzbackend.service.GroupService;
import org.example.noteuzbackend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje na grupach.
 */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final NoteService noteService;

    /**
     * Konstruktor kontrolera grup.
     * @param groupService Serwis do obsługi grup.
     * @param noteService Serwis do obsługi notatek.
     */
    public GroupController(GroupService groupService, NoteService noteService) {
        this.groupService = groupService;
        this.noteService = noteService;
    }

    /**
     * Pobiera listę grup, do których należy zalogowany użytkownik.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą grup.
     */
    @GetMapping
    public ResponseEntity<?> listMyGroups(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getUserGroups(userId));
    }

    /**
     * Pobiera szczegółowe informacje o grupie, w tym listę członków.
     * @param id Identyfikator grupy.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity ze szczegółami grupy.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupDetails(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getGroupDetails(id, userId));
    }

    /**
     * Tworzy nową grupę.
     * @param body Dane nowej grupy (nazwa, opis).
     * @param userId Identyfikator zalogowanego użytkownika (twórcy).
     * @return ResponseEntity z utworzoną grupą.
     */
    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        // Zabezpieczenie na wypadek nulli z frontu
        String name = body.name() != null ? body.name() : "Nowa Grupa";
        String desc = body.description() != null ? body.description() : "";

        return ResponseEntity.ok(groupService.createGroup(userId, name, desc));
    }

    /**
     * Zaprasza użytkownika do grupy na podstawie adresu email.
     * @param id Identyfikator grupy.
     * @param body Dane zaproszenia (email użytkownika).
     * @param userId Identyfikator zalogowanego użytkownika wysyłającego zaproszenie.
     * @return ResponseEntity z potwierdzeniem wysłania zaproszenia.
     */
    @PostMapping("/{id}/members")
    public ResponseEntity<?> inviteMember(@PathVariable UUID id, @RequestBody InviteMemberRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        if (body.email() == null || body.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Wymagany jest email"));
        }

        groupService.inviteUserByEmail(id, userId, body.email());
        return ResponseEntity.ok().build();
    }

    /**
     * Pobiera zaproszenia do grup dla zalogowanego użytkownika.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą zaproszeń.
     */
    @GetMapping("/invitations")
    public ResponseEntity<?> getMyInvitations(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(groupService.getUserInvitations(userId));
    }

    /**
     * Odpowiada na zaproszenie do grupy (akceptacja lub odrzucenie).
     * @param invitationId Identyfikator zaproszenia.
     * @param body Decyzja (czy zaakceptować).
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z potwierdzeniem operacji.
     */
    @PostMapping("/invitations/{invitationId}")
    public ResponseEntity<?> respondInvitation(@PathVariable UUID invitationId,
                                               @RequestBody InvitationResponseRequest body,
                                               @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();

        boolean accept = body.accept() != null ? body.accept() : false;
        groupService.respondToInvitation(invitationId, userId, accept);

        return ResponseEntity.ok().build();
    }

    /**
     * Usuwa członka z grupy.
     * @param id Identyfikator grupy.
     * @param targetUserId Identyfikator użytkownika do usunięcia.
     * @param userId Identyfikator zalogowanego użytkownika wykonującego akcję.
     * @return ResponseEntity z potwierdzeniem usunięcia.
     */
    @DeleteMapping("/{id}/members/{targetUserId}")
    public ResponseEntity<?> removeMember(@PathVariable UUID id, @PathVariable UUID targetUserId, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        groupService.removeMember(id, userId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Zmienia rolę członka w grupie (np. nadaje uprawnienia admina grupy).
     * @param id Identyfikator grupy.
     * @param targetUserId Identyfikator użytkownika, któremu zmieniana jest rola.
     * @param body Nowa rola.
     * @param userId Identyfikator zalogowanego użytkownika wykonującego akcję.
     * @return ResponseEntity z potwierdzeniem zmiany roli.
     */
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

    /**
     * Pobiera listę notatek powiązanych z grupą.
     * @param id Identyfikator grupy.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą notatek grupy.
     */
    @GetMapping("/{id}/notes")
    public ResponseEntity<?> getGroupNotes(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(noteService.listGroupNotes(id));
    }

    /**
     * Tworzy nową notatkę wewnątrz grupy.
     * @param id Identyfikator grupy.
     * @param body Dane notatki (tytuł, treść).
     * @param userId Identyfikator zalogowanego użytkownika (autora).
     * @return ResponseEntity z utworzoną notatką.
     */
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