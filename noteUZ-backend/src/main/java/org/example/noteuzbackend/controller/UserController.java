package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.model.entity.UserAvatar;
import org.example.noteuzbackend.repository.UserAvatarRepo;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje na danych użytkownika.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAvatarRepo avatarRepo;

    /**
     * Konstruktor kontrolera użytkownika.
     * @param avatarRepo Repozytorium awatarów użytkowników.
     */
    public UserController(UserAvatarRepo avatarRepo) {
        this.avatarRepo = avatarRepo;
    }

    /**
     * Przesyła i zapisuje awatar dla zalogowanego użytkownika.
     * @param file Plik obrazu awatara.
     * @param userId Identyfikator zalogowanego użytkownika.
     * @return ResponseEntity z potwierdzeniem przesłania.
     * @throws IOException W przypadku błędu odczytu pliku.
     */
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file, @CurrentUser UUID userId) throws IOException {
        if (userId == null) return ResponseEntity.status(401).build();
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Plik jest pusty");

        UserAvatar avatar = new UserAvatar(userId, file.getBytes(), file.getContentType());
        avatarRepo.save(avatar);

        return ResponseEntity.ok().build();
    }

    /**
     * Pobiera awatar użytkownika o podanym identyfikatorze.
     * @param userId Identyfikator użytkownika, którego awatar ma zostać pobrany.
     * @return ResponseEntity zawierające dane binarne obrazu awatara.
     */
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
        return avatarRepo.findById(userId)
                .map(avatar -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(avatar.getContentType()))
                        .body(avatar.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}