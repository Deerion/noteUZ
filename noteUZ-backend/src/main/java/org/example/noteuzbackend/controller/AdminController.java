package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AdminService;
import org.example.noteuzbackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    private UUID getAdminIdFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        ResponseEntity<?> response = authService.getUser(token);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            Map<?, ?> body = (Map<?, ?>) response.getBody();
            String idStr = (String) body.get("id");
            UUID userId = UUID.fromString(idStr);

            // Weryfikacja czy user jest Adminem
            if (adminService.isAdmin(userId)) {
                return userId;
            }
        }
        return null;
    }

    // 1. LISTA UŻYTKOWNIKÓW
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).body("Brak uprawnień administratora");
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // 2. BANOWANIE / ODBANOWANIE
    @PostMapping("/users/{id}/ban")
    public ResponseEntity<?> toggleBan(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        adminService.toggleBan(id);
        return ResponseEntity.ok().build();
    }

    // 3. OSTRZEŻENIE
    @PostMapping("/users/{id}/warn")
    public ResponseEntity<?> warnUser(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        adminService.addWarning(id);
        return ResponseEntity.ok().build();
    }

    // 4. LISTA WSZYSTKICH NOTATEK
    @GetMapping("/notes")
    public ResponseEntity<?> getAllNotes(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(adminService.getAllNotes());
    }

    // 5. USUWANIE NOTATKI (GLOBALNE)
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        adminService.deleteNote(id);
        return ResponseEntity.ok().build();
    }

    // 6. LISTA WSZYSTKICH GRUP
    @GetMapping("/groups")
    public ResponseEntity<?> getAllGroups(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(adminService.getAllGroups());
    }

    // 7. USUWANIE GRUPY (GLOBALNE)
    @DeleteMapping("/groups/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (getAdminIdFromToken(token) == null) return ResponseEntity.status(403).build();
        adminService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    // 8. ZMIANA ROLI (NADAJ / ODBIERZ ADMINA)
    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> toggleAdminRole(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID requesterId = getAdminIdFromToken(token);
        if (requesterId == null) return ResponseEntity.status(403).build();

        // Zabezpieczenie: Nie pozwól odebrać admina samemu sobie (żeby się nie zablokować)
        if (requesterId.equals(id)) {
            return ResponseEntity.badRequest().body("Nie możesz odebrać uprawnień samemu sobie.");
        }

        adminService.toggleAdmin(id);
        return ResponseEntity.ok().build();
    }

    // 9. USUWANIE UŻYTKOWNIKA (NOWE)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id, @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        UUID adminId = getAdminIdFromToken(token);
        if (adminId == null) return ResponseEntity.status(403).build();

        if (adminId.equals(id)) {
            return ResponseEntity.badRequest().body("Nie możesz usunąć samego siebie.");
        }

        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}