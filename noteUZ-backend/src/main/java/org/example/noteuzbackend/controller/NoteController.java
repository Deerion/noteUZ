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

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService service;
    private final EmailService emailService;
    private final GroupMemberRepo groupMemberRepo;

    public NoteController(NoteService service, EmailService emailService, GroupMemberRepo groupMemberRepo) {
        this.service = service;
        this.emailService = emailService;
        this.groupMemberRepo = groupMemberRepo;
    }

    @GetMapping
    public ResponseEntity<?> list(@CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Nie jesteś zalogowany"));
        return ResponseEntity.ok(service.listNotes(userId));
    }

    // Tu potrzebujemy maila, więc bierzemy UserSummary
    @GetMapping("/shared")
    public ResponseEntity<?> listSharedNotes(@CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Musisz być zalogowany"));
        return ResponseEntity.ok(service.getSharedNotes(user.email(), user.id()));
    }

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

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteNote(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(service.toggleVote(id, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

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

    @GetMapping("/{id}/shares")
    public ResponseEntity<?> getNoteShares(@PathVariable UUID id, @CurrentUser UUID userId) {
        Note note = service.getNoteById(id);
        if (!note.getUserId().equals(userId)) return ResponseEntity.status(403).body(Map.of("message", "Brak dostępu"));
        return ResponseEntity.ok(service.getNoteShares(id));
    }

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

    @PutMapping("/share/{shareId}")
    public ResponseEntity<?> updateShare(@PathVariable UUID shareId, @RequestBody UpdateShareRequest body, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.updateSharePermission(shareId, NoteShare.Permission.valueOf(body.permission()));
        return ResponseEntity.ok(Map.of("message", "Zaktualizowano"));
    }

    @DeleteMapping("/share/{shareId}")
    public ResponseEntity<?> revokeShare(@PathVariable UUID shareId, @CurrentUser UUID userId) {
        if (userId == null) return ResponseEntity.status(401).build();
        service.revokeShare(shareId);
        return ResponseEntity.ok(Map.of("message", "Usunięto"));
    }
}