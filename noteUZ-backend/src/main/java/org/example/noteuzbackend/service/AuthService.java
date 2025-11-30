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
    private final RestClient hcaptchaHttp;
    private final String cookieName;
    private final int maxAge;
    private final String hcaptchaSecretKey;

    public AuthService(
            @Value("${supabase.auth.url}") String authUrl,
            @Value("${supabase.service_key}") String serviceKey,
            @Value("${app.jwt.cookie}") String cookieName,
            @Value("${app.jwt.maxAge}") int maxAge,
            @Value("${hcaptcha.secret_key}") String hcaptchaSecretKey
    ) {
        this.cookieName = cookieName;
        this.maxAge = maxAge;
        this.hcaptchaSecretKey = hcaptchaSecretKey;

        this.http = RestClient.builder()
                .baseUrl(authUrl)
                .defaultHeader("apikey", serviceKey)
                .defaultHeader("Authorization", "Bearer " + serviceKey)
                .defaultStatusHandler(HttpStatusCode::isError, (req, resp) -> {})
                .build();

        this.hcaptchaHttp = RestClient.builder()
                .baseUrl("https://hcaptcha.com")
                .build();
    }

    // ========== WERYFIKACJA CAPTCHA ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> verifyCaptcha(String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token CAPTCHA jest wymagany"));
        }
        try {
            String formBody = "secret=" + hcaptchaSecretKey + "&response=" + token;
            var resp = hcaptchaHttp.post()
                    .uri("/siteverify")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body(formBody)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            if (status >= 200 && status < 300 && respBody != null) {
                Object success = respBody.get("success");
                boolean isSuccess = success instanceof Boolean ? (Boolean) success : false;
                if (isSuccess) return ResponseEntity.ok(Map.of("captchaValid", true));
            }
            return ResponseEntity.badRequest().body(Map.of("message", "CAPTCHA nieważna"));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("message", "Błąd hCaptcha"));
        }
    }

    // ========== LOGOWANIE ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> signIn(String email, String password) {
        var body = Map.of("email", email, "password", password);
        try {
            var resp = http.post().uri("/token?grant_type=password").body(body).retrieve().toEntity(Map.class);
            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            if (status >= 200 && status < 300 && respBody != null) {
                Object at = respBody.get("access_token");
                String accessToken = at instanceof String ? (String) at : null;
                if (accessToken == null) return ResponseEntity.status(401).body(Map.of("message", "Brak tokena"));

                var cookie = ResponseCookie.from(cookieName, accessToken)
                        .httpOnly(true).path("/").maxAge(Duration.ofSeconds(maxAge)).sameSite("Lax").build();
                return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("authenticated", true));
            }
            return ResponseEntity.status(status).body(Map.of("message", "Błąd logowania"));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("message", "Błąd Auth API"));
        }
    }

    // ========== REJESTRACJA ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> register(String email, String password, String displayName) {
        // (Skrócona walidacja dla czytelności - użyj swojej pełnej z poprzedniego pliku jeśli chcesz)
        if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("message", "Brak danych"));

        try {
            var body = Map.of("email", email, "password", password, "data", Map.of("display_name", displayName));
            var resp = http.post().uri("/signup").body(body).retrieve().toEntity(Map.class);
            int status = resp.getStatusCode().value();
            if (status >= 200 && status < 300) return ResponseEntity.ok(Map.of("registered", true));
            return ResponseEntity.status(status).body(Map.of("message", "Błąd rejestracji"));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("message", "Błąd Auth API"));
        }
    }

    // ========== WYLOGOWANIE ==========
    public ResponseEntity<?> signOut() {
        var cookie = ResponseCookie.from(cookieName, "").httpOnly(true).path("/").maxAge(Duration.ZERO).sameSite("Lax").build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    // ========== POMOCNICZE: ID z Tokena ==========
    public String getUserIdFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(java.util.Base64.getDecoder().decode(parts[1]));
            String searchKey = "\"sub\":\"";
            int start = payload.indexOf(searchKey);
            if (start == -1) return null;
            start += searchKey.length();
            int end = payload.indexOf("\"", start);
            if (end == -1) return null;
            return payload.substring(start, end);
        } catch (Exception e) { return null; }
    }
}