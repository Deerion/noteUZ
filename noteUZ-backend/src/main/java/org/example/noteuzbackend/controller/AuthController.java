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

    public AuthController(AuthService auth, @Value("${app.jwt.cookie}") String cookieName) {
        this.auth = auth;
        this.cookieName = cookieName;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        var email = body.getOrDefault("email", "");
        var password = body.getOrDefault("password", "");
        return auth.signIn(email, password);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return auth.signOut();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(
            @CookieValue(value = "#{@environment.getProperty('app.jwt.cookie')}", required = false)
            String tokenFromCookie
    ) {
        boolean authenticated = tokenFromCookie != null && !tokenFromCookie.isBlank();
        if (!authenticated) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(Map.of("authenticated", true));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        var email = body.getOrDefault("email", "");
        var password = body.getOrDefault("password", "");
        var displayName = body.getOrDefault("displayName", "");
        return auth.register(email, password, displayName);
    }
}
