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

    // ========== LOGOWANIE ==========
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
                String accessToken = at instanceof String ? (String) at : null;

                if (accessToken == null || accessToken.isBlank()) {
                    return ResponseEntity.status(401)
                            .body(Map.of("message", "Brak access_token"));
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
            return ResponseEntity.status(502)
                    .body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    // ========== REJESTRACJA ==========
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> register(String email, String password, String displayName) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email i hasło są wymagane"));
        }

        if (displayName == null || displayName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nazwa użytkownika jest wymagana"));
        }

        if (!email.contains("@") || email.length() < 3) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nieprawidłowy adres email"));
        }

        if (displayName.length() < 2) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nazwa użytkownika musi mieć min. 2 znaki."));
        }

        if (displayName.length() > 32) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Nazwa użytkownika może mieć max. 32 znaki."));
        }

        if (password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło musi mieć min. 8 znaków."));
        }

        if (password.length() > 32) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło może mieć max. 32 znaki."));
        }

        if (password.contains(" ")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło nie może zawierać spacji."));
        }

        if (password.chars().noneMatch(Character::isDigit)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło musi zawierać co najmniej jedną cyfrę."));
        }

        if (password.chars().noneMatch(Character::isLowerCase)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło musi zawierać co najmniej jedną małą literę."));
        }

        if (password.chars().noneMatch(Character::isUpperCase)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Hasło musi zawierać co najmniej jedną wielką literę."));
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
            System.out.println("Register response body: " + respBody);

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
                return ResponseEntity.status(409)
                        .body(Map.of("message", "Użytkownik już istnieje"));
            }

            if (status == 422 && msg.toLowerCase().contains("already")) {
                return ResponseEntity.status(409)
                        .body(Map.of("message", "Użytkownik już istnieje"));
            }

            return ResponseEntity.status(status).body(Map.of("message", msg));

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Register exception: " + e.getMessage());
            return ResponseEntity.status(502)
                    .body(Map.of("message", "Błąd połączenia z Auth API"));
        }
    }

    // ========== WYLOGOWANIE ==========
    public ResponseEntity<?> signOut() {
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
