package org.example.noteuzbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
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
                .defaultStatusHandler(HttpStatusCode::isError, (req, resp) -> {})
                .build();
    }

    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> signIn(String email, String password) {
        var body = Map.of("email", email, "password", password);
        try {
            var resp = http.post()
                    .uri("/token?grant_type=password")
                    .body(body)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            if (status >= 200 && status < 300 && respBody != null) {
                Object at = respBody.get("access_token");
                String accessToken = at instanceof String ? (String) at : null;
                if (accessToken == null || accessToken.isBlank()) {
                    return ResponseEntity.status(401).body(Map.of("message", "Brak access_token"));
                }

                var cookie = ResponseCookie.from(cookieName, accessToken)
                        .httpOnly(true)
                        .path("/")
                        .maxAge(Duration.ofSeconds(maxAge))
                        .sameSite("Lax")
                        .build();

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookie.toString())
                        .body(Map.of("authenticated", true));
            }

            String msg = "Unauthorized";
            if (respBody != null && respBody.get("msg") instanceof String) {
                msg = (String) respBody.get("msg");
            } else if (respBody != null && respBody.get("message") instanceof String) {
                msg = (String) respBody.get("message");
            }
            return ResponseEntity.status(status).body(Map.of("message", msg));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(502).body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> register(String email, String password, String displayName) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email i hasło są wymagane"));
        }
        if (displayName == null || displayName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nazwa użytkownika jest wymagana"));
        }

        try {
            // Supabase Auth API — spróbuj z 'data' zamiast 'user_metadata'
            var body = Map.of(
                    "email", email,
                    "password", password,
                    "data", Map.of("display_name", displayName)
            );

            System.out.println("Register body: " + body); // DEBUG

            var resp = http.post()
                    .uri("/signup")
                    .body(body)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            System.out.println("Register response status: " + status); // DEBUG
            System.out.println("Register response body: " + respBody); // DEBUG

            if (status >= 200 && status < 300) {
                return ResponseEntity.ok(Map.of("registered", true));
            }

            String msg = "Rejestracja nie powiodła się";
            if (respBody != null && respBody.get("msg") instanceof String) {
                msg = (String) respBody.get("msg");
            } else if (respBody != null && respBody.get("message") instanceof String) {
                msg = (String) respBody.get("message");
            }

            if (status == 400 && msg.toLowerCase().contains("already")) {
                return ResponseEntity.status(409).body(Map.of("message", "Użytkownik już istnieje"));
            }
            if (status == 422 && msg.toLowerCase().contains("already")) {
                return ResponseEntity.status(409).body(Map.of("message", "Użytkownik już istnieje"));
            }

            return ResponseEntity.status(status).body(Map.of("message", msg));
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Register exception: " + e.getMessage()); // DEBUG
            return ResponseEntity.status(502).body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    public ResponseEntity<Void> signOut() {
        var cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
