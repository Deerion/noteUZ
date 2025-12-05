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

    // NOWE POLA
    private final String refreshCookieName;
    private final int refreshMaxAge;

    private final String hcaptchaSecretKey;

    public AuthService(
            @Value("${supabase.auth.url}") String authUrl,
            @Value("${supabase.service_key}") String serviceKey,
            @Value("${app.jwt.cookie}") String cookieName,
            @Value("${app.jwt.maxAge}") int maxAge,
            // Wstrzykujemy nowe wartości z application.properties
            @Value("${app.jwt.refreshCookie}") String refreshCookieName,
            @Value("${app.jwt.refreshMaxAge}") int refreshMaxAge,
            @Value("${hcaptcha.secret_key}") String hcaptchaSecretKey
    ) {
        this.cookieName = cookieName;
        this.maxAge = maxAge;
        this.refreshCookieName = refreshCookieName;
        this.refreshMaxAge = refreshMaxAge;
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

    // Pomocnicza metoda do tworzenia ciasteczek
    private ResponseCookie createCookie(String name, String value, int age) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofSeconds(age))
                .sameSite("Lax")
                // .secure(true) // Odkomentuj na produkcji (HTTPS)
                .build();
    }

    // ========== WERYFIKACJA CAPTCHA (Bez zmian) ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> verifyCaptcha(String token) {
        if (token == null || token.isBlank()) {
            System.out.println("❌ CAPTCHA: Token is blank");
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Token CAPTCHA jest wymagany"));
        }

        try {
            String formBody = "secret=" + hcaptchaSecretKey + "&response=" + token;
            System.out.println("📤 Sending CAPTCHA verification to hCaptcha...");

            var resp = hcaptchaHttp.post()
                    .uri("/siteverify")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body(formBody)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            System.out.println("📥 hCaptcha response status: " + status);
            System.out.println("📥 hCaptcha response body: " + respBody);

            if (status >= 200 && status < 300 && respBody != null) {
                Object success = respBody.get("success");
                boolean isSuccess = success instanceof Boolean ? (Boolean) success : false;

                if (isSuccess) {
                    System.out.println("✅ CAPTCHA VALID!");
                    return ResponseEntity.ok(Map.of("captchaValid", true));
                } else {
                    System.out.println("❌ CAPTCHA INVALID!");
                    Object errorCodes = respBody.get("error-codes");
                    String message = "CAPTCHA nieważna lub wygasła";
                    if (errorCodes != null) {
                        message += " (" + errorCodes.toString() + ")";
                    }
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", message));
                }
            }

            return ResponseEntity.status(status)
                    .body(Map.of("message", "Błąd weryfikacji CAPTCHA (status " + status + ")"));

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("❌ CAPTCHA verification error: " + e.getMessage());
            return ResponseEntity.status(502)
                    .body(Map.of("message", "Błąd połączenia z hCaptcha: " + e.getMessage()));
        }
    }

    // ========== LOGOWANIE (Zmodyfikowane) ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> signIn(String email, String password) {
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
                Object rt = respBody.get("refresh_token"); // Pobieramy Refresh Token

                String accessToken = at instanceof String ? (String) at : null;
                String refreshToken = rt instanceof String ? (String) rt : null;

                if (accessToken == null || accessToken.isBlank()) {
                    return ResponseEntity.status(401)
                            .body(Map.of("message", "Brak access_token"));
                }

                // 1. Ciasteczko Access Token (krótkie - 1h)
                var accessCookie = createCookie(cookieName, accessToken, maxAge);

                // 2. Ciasteczko Refresh Token (długie - 7 dni)
                var refreshCookie = createCookie(refreshCookieName, refreshToken != null ? refreshToken : "", refreshMaxAge);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                        .header(HttpHeaders.SET_COOKIE, refreshCookie.toString()) // Dodajemy drugie ciasteczko
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
            return ResponseEntity.status(502)
                    .body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    // ========== ODŚWIEŻANIE SESJI (Nowa metoda) ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> refreshSession(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Brak tokena odświeżania"));
        }

        try {
            var body = Map.of("refresh_token", refreshToken);

            // Wysyłamy żądanie refresh do Supabase
            var resp = http.post()
                    .uri("/token?grant_type=refresh_token")
                    .body(body)
                    .retrieve()
                    .toEntity(Map.class);

            var respBody = resp.getBody();
            if (resp.getStatusCode().is2xxSuccessful() && respBody != null) {
                String newAccessToken = (String) respBody.get("access_token");
                String newRefreshToken = (String) respBody.get("refresh_token");

                if (newAccessToken != null) {
                    // Odświeżamy Access Token (na kolejną 1h)
                    var accessCookie = createCookie(cookieName, newAccessToken, maxAge);

                    // Odświeżamy Refresh Token (jeśli przyszedł nowy, to go ustawiamy, jak nie - przedłużamy stary)
                    String rtToSet = (newRefreshToken != null) ? newRefreshToken : refreshToken;
                    var refreshCookie = createCookie(refreshCookieName, rtToSet, refreshMaxAge);

                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                            .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                            .body(Map.of("refreshed", true));
                }
            }
            return ResponseEntity.status(401).body(Map.of("message", "Nie udało się odświeżyć sesji"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Sesja wygasła lub błąd API"));
        }
    }

    // ========== POBIERANIE DANYCH UŻYTKOWNIKA (Bez zmian) ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> getUser(String accessToken) {
        try {
            var resp = http.get()
                    .uri("/user")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var body = resp.getBody();

            if (status >= 200 && status < 300) {
                return ResponseEntity.ok(body);
            }
            return ResponseEntity.status(status).body(Map.of("message", "Nie udało się pobrać danych użytkownika"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Token wygasł lub jest nieprawidłowy"));
        }
    }

    // ========== REJESTRACJA (Bez zmian) ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> register(String email, String password, String displayName) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email i hasło są wymagane"));
        }
        if (displayName == null || displayName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nazwa użytkownika jest wymagana"));
        }
        if (!email.contains("@") || email.length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nieprawidłowy adres email"));
        }
        if (displayName.length() < 2 || displayName.length() > 32) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nazwa użytkownika musi mieć od 2 do 32 znaków."));
        }
        if (password.length() < 8 || password.length() > 32) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hasło musi mieć od 8 do 32 znaków."));
        }
        if (password.contains(" ")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hasło nie może zawierać spacji."));
        }
        if (password.chars().noneMatch(Character::isDigit)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hasło musi zawierać co najmniej jedną cyfrę."));
        }
        if (password.chars().noneMatch(Character::isLowerCase)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hasło musi zawierać małą literę."));
        }
        if (password.chars().noneMatch(Character::isUpperCase)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hasło musi zawierać wielką literę."));
        }

        try {
            var body = Map.of(
                    "email", email,
                    "password", password,
                    "data", Map.of("display_name", displayName)
            );

            System.out.println("Register body: " + body);

            var resp = http.post()
                    .uri("/signup")
                    .body(body)
                    .retrieve()
                    .toEntity(Map.class);

            int status = resp.getStatusCode().value();
            var respBody = resp.getBody();

            System.out.println("Register response status: " + status);

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
            System.out.println("Register exception: " + e.getMessage());
            return ResponseEntity.status(502).body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    // ========== WYLOGOWANIE (Zmodyfikowane) ==========
    public ResponseEntity<?> signOut() {
        // Czyścimy OBA ciasteczka
        var c1 = createCookie(cookieName, "", 0);
        var c2 = createCookie(refreshCookieName, "", 0);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, c1.toString())
                .header(HttpHeaders.SET_COOKIE, c2.toString())
                .build();
    }
}