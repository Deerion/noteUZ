package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.dto.AuthRequests.*;
import org.example.noteuzbackend.service.AdminService;
import org.example.noteuzbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Kontroler obsługujący operacje autentykacji.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final AdminService adminService;

    /**
     * Konstruktor kontrolera autentykacji.
     * @param auth Serwis autentykacji.
     * @param adminService Serwis administracyjny.
     */
    public AuthController(AuthService auth, AdminService adminService) {
        this.auth = auth;
        this.adminService = adminService;
    }

    /**
     * Loguje użytkownika do systemu.
     * @param body Dane logowania wraz z tokenem hCaptcha.
     * @return ResponseEntity z wynikiem logowania (ciasteczka sesji).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        // Logika Captcha
        ResponseEntity<?> captchaResponse = auth.verifyCaptcha(body.captchaToken());
        if (!captchaResponse.getStatusCode().is2xxSuccessful()) {
            return captchaResponse;
        }
        return auth.signIn(body.email(), body.password());
    }

    /**
     * Wylogowuje użytkownika z systemu.
     * @return ResponseEntity z nagłówkami usuwającymi ciasteczka sesji.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return auth.signOut();
    }

    /**
     * Odświeża sesję użytkownika na podstawie tokenu odświeżania.
     * @param refreshToken Token odświeżania pobrany z ciasteczka.
     * @return ResponseEntity z nowym tokenem dostępu.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(value = "${app.jwt.refreshCookie}", required = false) String refreshToken) {
        return auth.refreshSession(refreshToken);
    }

    /**
     * Pobiera informacje o aktualnie zalogowanym użytkowniku.
     * @param token Token dostępu JWT pobrany z ciasteczka.
     * @return ResponseEntity z danymi użytkownika, rolami i ostrzeżeniami.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }

        ResponseEntity<?> userResponse = auth.getUser(token);

        if (userResponse.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> userData = (Map<String, Object>) userResponse.getBody();
            if (userData != null) {
                String idStr = (String) userData.get("id");
                if (idStr != null) {
                    UUID userId = UUID.fromString(idStr);

                    // Sprawdzamy rolę w naszej bazie
                    boolean isAdmin = adminService.isAdmin(userId);
                    boolean isMod = adminService.isAtLeastModerator(userId);

                    // NOWE: Pobieramy liczbę ostrzeżeń
                    int warningCount = adminService.getWarningCount(userId);

                    // Frontend dostanie informację o roli i ostrzeżeniach
                    userData.put("isAdmin", isAdmin);
                    userData.put("isModerator", isMod);
                    userData.put("role", isAdmin ? "ADMIN" : (isMod ? "MODERATOR" : "USER"));

                    // Dodajemy ostrzeżenia do odpowiedzi
                    userData.put("warnings", warningCount);
                }
            }
            return ResponseEntity.ok(userData);
        }
        return ResponseEntity.status(401).body(Map.of("authenticated", false));
    }

    /**
     * Rejestruje nowego użytkownika w systemie.
     * @param body Dane rejestracji wraz z tokenem hCaptcha.
     * @return ResponseEntity z wynikiem rejestracji.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest body) {
        ResponseEntity<?> captchaResponse = auth.verifyCaptcha(body.captchaToken());
        if (!captchaResponse.getStatusCode().is2xxSuccessful()) {
            return captchaResponse;
        }
        return auth.register(body.email(), body.password(), body.displayName());
    }
}