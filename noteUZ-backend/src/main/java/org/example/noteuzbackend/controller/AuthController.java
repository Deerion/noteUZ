package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final String cookieName;
    private final String hcaptchaSecretKey;

    public AuthController(
            AuthService auth,
            @Value("${app.jwt.cookie}") String cookieName,
            @Value("${hcaptcha.secret_key}") String hcaptchaSecretKey
    ) {
        this.auth = auth;
        this.cookieName = cookieName;
        this.hcaptchaSecretKey = hcaptchaSecretKey;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        var email = body.getOrDefault("email", "");
        var password = body.getOrDefault("password", "");
        var captchaToken = body.getOrDefault("captchaToken", "");

        System.out.println("Login request - email: " + email + ", has token: " + !captchaToken.isBlank());

        // Weryfikuj CAPTCHA
        ResponseEntity<?> captchaResponse = auth.verifyCaptcha(captchaToken);
        if (!captchaResponse.getStatusCode().is2xxSuccessful()) {
            return captchaResponse;
        }

        return auth.signIn(email, password);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return auth.signOut();
    }

    // NOWY ENDPOINT: Odświeżanie tokena
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "${app.jwt.refreshCookie}", required = false) String refreshToken
    ) {
        // Przekazujemy ciasteczko refresh do serwisu
        return auth.refreshSession(refreshToken);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            @CookieValue(value = "${app.jwt.cookie}", required = false) String tokenFromCookie
    ) {
        if (tokenFromCookie == null || tokenFromCookie.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }

        // Pobieramy pełne dane usera z Supabase
        ResponseEntity<?> userResponse = auth.getUser(tokenFromCookie);

        if (userResponse.getStatusCode().is2xxSuccessful()) {
            // Doklejamy flagę authenticated dla frontendu
            Map<String, Object> userData = (Map<String, Object>) userResponse.getBody();
            // Możesz tu opakować odpowiedź, ale zwrócenie całego obiektu User z Supabase jest ok
            return ResponseEntity.ok(userData);
        }

        return ResponseEntity.status(401).body(Map.of("authenticated", false));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        var email = body.getOrDefault("email", "");
        var password = body.getOrDefault("password", "");
        var displayName = body.getOrDefault("displayName", "");
        var captchaToken = body.getOrDefault("captchaToken", "");

        System.out.println("Register request - email: " + email + ", displayName: " + displayName + ", has token: " + !captchaToken.isBlank());

        // Weryfikuj CAPTCHA
        ResponseEntity<?> captchaResponse = auth.verifyCaptcha(captchaToken);
        if (!captchaResponse.getStatusCode().is2xxSuccessful()) {
            return captchaResponse;
        }

        return auth.register(email, password, displayName);
    }
}