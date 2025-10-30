package org.example.noteuzbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AuthService {
    private final RestClient http;
    private final String cookieName;
    private final int maxAge;

    public AuthService(
            @Value("${supabase.auth.url}") String authUrl,
            @Value("${supabase.service_key}") String serviceKey,
            @Value("${app.jwt.cookie}") String cookieName,
            @Value("${app.jwt.maxAge}") int maxAge
    ) {
        this.cookieName = cookieName;
        this.maxAge = maxAge;
        this.http = RestClient.builder()
                .baseUrl(authUrl)
                .defaultHeader("apikey", serviceKey)
                .defaultHeader("Authorization", "Bearer " + serviceKey)
                .build();
    }

    public ResponseEntity<Map<String, Object>> signIn(String email, String password) {
        var body = Map.of("email", email, "password", password);
        Map<String, Object> tokens;

        try {
            var resp = http.post().uri("/token?grant_type=password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
            tokens = resp.getBody();
        } catch (org.springframework.web.client.RestClientResponseException ex) {
            // Supabase GoTrue zwraca 400 dla invalid_credentials → mapujemy na 401
            if (ex.getStatusCode().value() == 400) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }
            // inne kody przepuszczamy jako 502/Bad Gateway z krótkim komunikatem
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Auth upstream error"));
        }

        if (tokens == null || !tokens.containsKey("access_token")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        String access = String.valueOf(tokens.get("access_token"));
        String cookie = cookieName + "=" + access
                + "; HttpOnly; Path=/; Max-Age=" + maxAge + "; SameSite=Lax";
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie)
                .body(Map.of("ok", true));
    }

    public ResponseEntity<Void> signOut() {
        String cookie = cookieName + "=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax";
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie)
                .build();
    }
}
