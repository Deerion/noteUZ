package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.model.entity.UserAvatar;
import org.example.noteuzbackend.repository.UserAvatarRepo;
import org.example.noteuzbackend.service.AuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAvatarRepo avatarRepo;
    private final AuthService authService;

    public UserController(UserAvatarRepo avatarRepo, AuthService authService) {
        this.avatarRepo = avatarRepo;
        this.authService = authService;
    }

    // Helper: Pobierz ID usera z tokena (kopiowane z NoteController)
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

    // 1. WGRYWANIE AVATARA (POST)
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @CookieValue(value = "${app.jwt.cookie}", required = false) String token
    ) throws IOException {
        UUID userId = getUserIdFromToken(token);
        if (userId == null) return ResponseEntity.status(401).build();

        if (file.isEmpty()) return ResponseEntity.badRequest().body("Plik jest pusty");

        // Zapisz lub nadpisz avatar
        UserAvatar avatar = new UserAvatar(userId, file.getBytes(), file.getContentType());
        avatarRepo.save(avatar);

        return ResponseEntity.ok().build();
    }

    // 2. POBIERANIE AVATARA (GET) - Publiczne lub chronione (zależy od Ciebie)
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
        return avatarRepo.findById(userId)
                .map(avatar -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(avatar.getContentType()))
                        .body(avatar.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}