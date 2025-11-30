package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService service;
    private final AuthService authService;

    public NoteController(NoteService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    private UUID getUserId(String token) {
        String idStr = authService.getUserIdFromToken(token);
        return idStr != null ? UUID.fromString(idStr) : null;
    }

    @GetMapping
    public ResponseEntity<?> list(@CookieValue(name = "${app.jwt.cookie}", required = false) String token) {
        UUID userId = getUserId(token);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getUserNotes(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @CookieValue(name = "${app.jwt.cookie}", required = false) String token,
            @RequestBody Map<String, String> body) {
        UUID userId = getUserId(token);
        if (userId == null) return ResponseEntity.status(401).build();

        return ResponseEntity.ok(service.create(
                userId,
                body.getOrDefault("title", ""),
                body.getOrDefault("content", "")
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @CookieValue(name = "${app.jwt.cookie}", required = false) String token,
            @PathVariable UUID id) {
        UUID userId = getUserId(token);
        if (userId == null) return ResponseEntity.status(401).build();

        service.delete(id, userId);
        return ResponseEntity.ok().build();
    }
}