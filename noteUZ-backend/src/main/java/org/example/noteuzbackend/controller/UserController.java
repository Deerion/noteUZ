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

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAvatarRepo avatarRepo;

    public UserController(UserAvatarRepo avatarRepo) {
        this.avatarRepo = avatarRepo;
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file, @CurrentUser UUID userId) throws IOException {
        if (userId == null) return ResponseEntity.status(401).build();
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Plik jest pusty");

        UserAvatar avatar = new UserAvatar(userId, file.getBytes(), file.getContentType());
        avatarRepo.save(avatar);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
        return avatarRepo.findById(userId)
                .map(avatar -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(avatar.getContentType()))
                        .body(avatar.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}