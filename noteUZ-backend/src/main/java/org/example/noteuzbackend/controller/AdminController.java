package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    private void checkAccess(UUID userId) {
        if (userId == null) throw new RuntimeException("Unauthorized");
        adminService.ensureAtLeastModerator(userId);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/notes")
    public ResponseEntity<?> getAllNotes(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllNotes());
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getAllGroups(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllGroups());
    }

    // --- AKCJE ---

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<?> toggleBan(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.toggleBan(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/warn")
    public ResponseEntity<?> warnUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.addWarning(id, userId);
        return ResponseEntity.ok().build();
    }

    // --- NOWY ENDPOINT: Cofanie ostrzeżenia ---
    @PostMapping("/users/{id}/unwarn")
    public ResponseEntity<?> unwarnUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.removeWarning(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteToModerator(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.promoteToModerator(id, userId);
        return ResponseEntity.ok(Map.of("message", "Użytkownik mianowany Moderatorem"));
    }

    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demoteToUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.demoteToUser(id, userId);
        return ResponseEntity.ok(Map.of("message", "Użytkownik zdegradowany do rangi User"));
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable UUID id, @CurrentUser UUID userId) {
        checkAccess(userId);
        adminService.deleteNote(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable UUID id, @CurrentUser UUID userId) {
        checkAccess(userId);
        adminService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId.equals(id)) return ResponseEntity.badRequest().body("Nie możesz usunąć samego siebie.");
        adminService.deleteUser(id, userId);
        return ResponseEntity.ok().build();
    }
}