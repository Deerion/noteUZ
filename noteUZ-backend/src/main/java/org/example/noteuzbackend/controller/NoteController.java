package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.dto.NoteRequests.*;
import org.example.noteuzbackend.dto.UserSummary;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteShare;
import org.example.noteuzbackend.repository.GroupMemberRepo;
import org.example.noteuzbackend.service.EmailService;
import org.example.noteuzbackend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje na notatkach.
 */
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService service;
    private final EmailService emailService;
    private final GroupMemberRepo groupMemberRepo;

    /**
     * Konstruktor kontrolera notatek.
     * @param service Serwis notatek.
     * @param emailService Serwis wysyłania emaili.
     * @param groupMemberRepo Repozytorium członków grup.
     */
    public NoteController(NoteService service, EmailService emailService, GroupMemberRepo groupMemberRepo) {
        this.service = service;
        this.emailService = emailService;
        this.groupMemberRepo = groupMemberRepo;
    }

    /**
     * Pobiera listę notatek użytkownika.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą notatek.
     */
    @GetMapping
    public ResponseEntity<?> list(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        return ResponseEntity.ok(service.listNotes(userId));
    }

    /**
     * Pobiera listę notatek udostępnionych użytkownikowi.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z listą udostępnionych notatek.
     */
    @GetMapping("/shared")
    public ResponseEntity<?> listSharedNotes(@CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Musisz być zalogowany"));
        return ResponseEntity.ok(service.getSharedNotes(user.email(), user.id()));
    }

    /**
     * Pobiera szczegóły konkretnej notatki.
     * @param id Identyfikator notatki.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z danymi notatki i uprawnieniami.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id, user.id());
        String permission = null;

        if (note.getUserId().equals(user.id())) permission = "OWNER";

        if (permission == null && note.getGroupId() != null) {
            if (groupMemberRepo.existsByGroupIdAndUserId(note.getGroupId(), user.id())) permission = "WRITE";
        }

        if (!"OWNER".equals(permission) && !"WRITE".equals(permission)) {
            var shareOpt = service.findShare(id, user.email()); // Używamy maila z obiektu
            if (shareOpt.isPresent() && shareOpt.get().getStatus() == NoteShare.ShareStatus.ACCEPTED) {
                String sharePerm = shareOpt.get().getPermission().toString();
                if (permission == null) permission = sharePerm;
                else if ("READ".equals(permission) && "WRITE".equals(sharePerm)) permission = "WRITE";
            }
        }

        if (permission == null) return ResponseEntity.status(403).build();

        return ResponseEntity.ok(Map.of(
                "id", note.getId(),
                "title", note.getTitle(),
                "content", note.getContent(),
                "userId", note.getUserId(),
                "groupId", note.getGroupId() != null ? note.getGroupId() : "null",
                "createdAt", note.getCreatedAt(),
                "permission", permission,
                "voteCount", note.getVoteCount(),
                "votedByMe", note.isVotedByMe()
        ));
    }

    /**
     * Tworzy nową notatkę.
     * @param body Dane nowej notatki.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z informacją o utworzonej notatce.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody CreateNoteRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));

        Note saved;
        if (body.groupId() != null) {
            saved = service.createGroupNote(body.groupId(), userId, body.title(), body.content());
        } else {
            saved = service.create(userId, body.title(), body.content());
        }
        return ResponseEntity.ok(Map.of("id", saved.getId(), "title", saved.getTitle()));
    }

    /**
     * Aktualizuje istniejącą notatkę.
     * @param id Identyfikator notatki.
     * @param body Nowe dane notatki.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z wynikiem operacji.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody UpdateNoteRequest body, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();

        Note existing = service.getNoteById(id);
        boolean hasPermission = false;

        if (existing.getUserId().equals(user.id())) hasPermission = true;
        if (!hasPermission && existing.getGroupId() != null) {
            if (groupMemberRepo.existsByGroupIdAndUserId(existing.getGroupId(), user.id())) hasPermission = true;
        }
        if (!hasPermission) {
            var shareOpt = service.findShare(id, user.email());
            if (shareOpt.isPresent() && shareOpt.get().getPermission() == NoteShare.Permission.WRITE) hasPermission = true;
        }

        if (!hasPermission) return ResponseEntity.status(403).body(Map.of("message", "Brak uprawnień"));

        var updated = service.update(id, body.title(), body.content());
        return ResponseEntity.ok(Map.of("id", updated.getId()));
    }

    /**
     * Usuwa notatkę lub cofa udostępnienie.
     * @param id Identyfikator notatki.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z wynikiem operacji.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);

        if (note.getUserId().equals(user.id())) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } else {
            // Tutaj używamy user.email() zamiast wołać authService
            Optional<NoteShare> share = service.findShare(id, user.email());
            if (share.isPresent()) {
                service.revokeShare(share.get().getId());
                return ResponseEntity.ok(Map.of("message", "Usunięto notatkę z listy udostępnionych"));
            }
            return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu"));
        }
    }

    /**
     * Oddaje głos na notatkę (lub go cofa).
     * @param id Identyfikator notatki.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z nowym stanem głosowania.
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteNote(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(service.toggleVote(id, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Udostępnia notatkę innemu użytkownikowi poprzez email.
     * @param id Identyfikator notatki.
     * @param body Dane udostępniania (email, uprawnienia).
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z informacją o wysłanym zaproszeniu.
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareNote(@PathVariable UUID id, @RequestBody ShareNoteRequest body, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();

        Note note = service.getNoteById(id);
        if (!note.getUserId().equals(user.id())) return ResponseEntity.status(403).body(Map.of("message", "Tylko właściciel może udostępniać"));

        String permissionStr = body.permission() != null ? body.permission() : "READ";
        NoteShare.Permission permission = NoteShare.Permission.valueOf(permissionStr);

        try {
            String shareUrl = service.createShare(id, user.id(), body.email(), permission);
            try {
                // user.email() to email nadawcy (właściciela)
                emailService.sendShareInvitation(body.email(), user.email(), note.getTitle(), shareUrl, permissionStr);
            } catch (Exception e) {
                System.err.println("Błąd wysyłania maila: " + e.getMessage());
            }
            return ResponseEntity.ok(Map.of("message", "Wysłano", "shareUrl", shareUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Pobiera listę udostępnień danej notatki.
     * @param id Identyfikator notatki.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z listą udostępnień.
     */
    @GetMapping("/{id}/shares")
    public ResponseEntity<?> getNoteShares(@PathVariable UUID id, @CurrentUser UUID userId) {
        Note note = service.getNoteById(id);
        if (!note.getUserId().equals(userId)) return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu"));
        return ResponseEntity.ok(service.getNoteShares(id));
    }

    /**
     * Akceptuje zaproszenie do udostępnionej notatki.
     * @param token Token udostępnienia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z wynikiem operacji.
     */
    @PostMapping("/share/{token}/accept")
    public ResponseEntity<?> acceptShare(@PathVariable String token, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Zaloguj się"));
        try {
            service.acceptShare(UUID.fromString(token), userId);
            return ResponseEntity.ok(Map.of("message", "Zaakceptowano"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Aktualizuje uprawnienia do udostępnionej notatki.
     * @param shareId Identyfikator udostępnienia.
     * @param body Nowe uprawnienia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z informacją o zaktualizowaniu.
     */
    @PutMapping("/share/{shareId}")
    public ResponseEntity<?> updateShare(@PathVariable UUID shareId, @RequestBody UpdateShareRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.updateSharePermission(shareId, NoteShare.Permission.valueOf(body.permission()));
        return ResponseEntity.ok(Map.of("message", "Zaktualizowano"));
    }

    /**
     * Cofa udostępnienie notatki konkretnemu użytkownikowi.
     * @param shareId Identyfikator udostępnienia.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z informacją o usunięciu.
     */
    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<?> revokeShare(@PathVariable UUID shareId, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.revokeShare(shareId);
        return ResponseEntity.ok(Map.of("message", "Usunięto"));
    }
}