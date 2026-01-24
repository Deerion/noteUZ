package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje administracyjne.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    /**
     * Konstruktor kontrolera administracyjnego.
     * @param adminService Serwis administracyjny.
     */
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Sprawdza, czy użytkownik ma uprawnienia co najmniej moderatora.
     * @param userId Identyfikator użytkownika do sprawdzenia.
     * @throws RuntimeException Jeśli użytkownik nie jest zalogowany lub nie ma uprawnień.
     */
    private void checkAccess(UUID userId) {
        if (userId == null) throw new RuntimeException("Unauthorized");
        adminService.ensureAtLeastModerator(userId);
    }

    /**
     * Pobiera listę wszystkich użytkowników (dla admina/moderatora).
     * @param userId Identyfikator zalogowanego użytkownika sprawdzającego.
     * @return ResponseEntity z listą wszystkich użytkowników.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Pobiera listę wszystkich notatek w systemie.
     * @param userId Identyfikator zalogowanego użytkownika sprawdzającego.
     * @return ResponseEntity z listą wszystkich notatek.
     */
    @GetMapping("/notes")
    public ResponseEntity<?> getAllNotes(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllNotes());
    }

    /**
     * Pobiera listę wszystkich grup w systemie.
     * @param userId Identyfikator zalogowanego użytkownika sprawdzającego.
     * @return ResponseEntity z listą wszystkich grup.
     */
    @GetMapping("/groups")
    public ResponseEntity<?> getAllGroups(@CurrentUser UUID userId) {
        checkAccess(userId);
        return ResponseEntity.ok(adminService.getAllGroups());
    }

    /**
     * Przełącza blokadę (ban) użytkownika.
     * @param id Identyfikator użytkownika, którego dotyczy akcja.
     * @param userId Identyfikator zalogowanego moderatora/admina.
     * @return ResponseEntity z potwierdzeniem operacji.
     */
    @PostMapping("/users/{id}/ban")
    public ResponseEntity<?> toggleBan(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.toggleBan(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Dodaje ostrzeżenie użytkownikowi.
     * @param id Identyfikator użytkownika, którego dotyczy akcja.
     * @param userId Identyfikator zalogowanego moderatora/admina.
     * @return ResponseEntity z potwierdzeniem operacji.
     */
    @PostMapping("/users/{id}/warn")
    public ResponseEntity<?> warnUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.addWarning(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Cofa ostatnie ostrzeżenie użytkownikowi.
     * @param id Identyfikator użytkownika, którego dotyczy akcja.
     * @param userId Identyfikator zalogowanego moderatora/admina.
     * @return ResponseEntity z potwierdzeniem operacji.
     */
    @PostMapping("/users/{id}/unwarn")
    public ResponseEntity<?> unwarnUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.removeWarning(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Nadaje użytkownikowi rangę moderatora.
     * @param id Identyfikator użytkownika, którego dotyczy akcja.
     * @param userId Identyfikator zalogowanego administratora.
     * @return ResponseEntity z komunikatem o sukcesie.
     */
    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteToModerator(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.promoteToModerator(id, userId);
        return ResponseEntity.ok(Map.of("message", "Użytkownik mianowany Moderatorem"));
    }

    /**
     * Degraduje użytkownika do rangi zwykłego użytkownika.
     * @param id Identyfikator użytkownika, którego dotyczy akcja.
     * @param userId Identyfikator zalogowanego administratora.
     * @return ResponseEntity z komunikatem o sukcesie.
     */
    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demoteToUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        adminService.demoteToUser(id, userId);
        return ResponseEntity.ok(Map.of("message", "Użytkownik zdegradowany do rangi User"));
    }

    /**
     * Usuwa notatkę ze względów administracyjnych.
     * @param id Identyfikator notatki.
     * @param userId Identyfikator zalogowanego moderatora/admina.
     * @return ResponseEntity z potwierdzeniem usunięcia.
     */
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable UUID id, @CurrentUser UUID userId) {
        checkAccess(userId);
        adminService.deleteNote(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Usuwa grupę ze względów administracyjnych.
     * @param id Identyfikator grupy.
     * @param userId Identyfikator zalogowanego moderatora/admina.
     * @return ResponseEntity z potwierdzeniem usunięcia.
     */
    @DeleteMapping("/groups/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable UUID id, @CurrentUser UUID userId) {
        checkAccess(userId);
        adminService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Usuwa użytkownika z systemu.
     * @param id Identyfikator użytkownika do usunięcia.
     * @param userId Identyfikator zalogowanego administratora.
     * @return ResponseEntity z potwierdzeniem usunięcia lub błędem jeśli próbuje usunąć siebie.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id, @CurrentUser UUID userId) {
        if (userId.equals(id)) return ResponseEntity.badRequest().body("Nie możesz usunąć samego siebie.");
        adminService.deleteUser(id, userId);
        return ResponseEntity.ok().build();
    }
}