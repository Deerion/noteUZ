package org.example.noteuzbackend.dto;

/**
 * Klasa kontenerowa dla rekordów żądań związanych z autentykacją.
 */
public class AuthRequests {
    /**
     * Obiekt DTO reprezentujący żądanie logowania.
     *
     * @param email Adres email użytkownika.
     * @param password Hasło użytkownika.
     * @param captchaToken Token weryfikacyjny hCaptcha.
     */
    public record LoginRequest(String email, String password, String captchaToken) {}

    /**
     * Obiekt DTO reprezentujący żądanie rejestracji.
     *
     * @param email Adres email użytkownika.
     * @param password Hasło użytkownika.
     * @param displayName Nazwa wyświetlana użytkownika.
     * @param captchaToken Token weryfikacyjny hCaptcha.
     */
    public record RegisterRequest(String email, String password, String displayName, String captchaToken) {}
}