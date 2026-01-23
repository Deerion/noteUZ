package org.example.noteuzbackend.config.resolver;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.example.noteuzbackend.dto.UserSummary;
import org.example.noteuzbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/**
 * Argument resolver do wstrzykiwania identyfikatora użytkownika z żądania.
 */
@Component
public class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;
    private final String cookieName; // <--- Dodajemy pole na nazwę ciasteczka

    /**
     * Konstruktor resolvera identyfikatora użytkownika.
     * @param authService Serwis do autentykacji.
     * @param cookieName Nazwa ciasteczka zawierającego token JWT.
     */
    public UserIdArgumentResolver(AuthService authService,
                                  @Value("${app.jwt.cookie}") String cookieName) {
        this.authService = authService;
        this.cookieName = cookieName;
    }

    /**
     * Sprawdza, czy dany parametr jest obsługiwany przez ten resolver.
     * @param parameter Parametr metody do sprawdzenia.
     * @return true, jeśli parametr jest obsługiwany, false w przeciwnym razie.
     */
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null
                && (parameter.getParameterType().equals(UUID.class) || parameter.getParameterType().equals(UserSummary.class));
    }

    /**
     * Rozwiązuje argument, pobierając identyfikator użytkownika lub podsumowanie użytkownika z ciasteczka JWT.
     * @param parameter Parametr metody do rozwiązywania.
     * @param mavContainer Kontener dla modeli i widoków.
     * @param webRequest Obecne żądanie webowe.
     * @param binderFactory Fabryka do tworzenia binderów danych.
     * @return Identyfikator użytkownika (UUID) lub obiekt UserSummary, lub null jeśli nie znaleziono tokenu.
     */
    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {

        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        String token = null;

        if (request.getCookies() != null) {
            token = Arrays.stream(request.getCookies())
                    // Używamy dynamicznej nazwy ciasteczka zamiast hardcodowanego "jwt"
                    .filter(c -> cookieName.equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        if (token == null) return null;

        ResponseEntity<?> response = authService.getUser(token);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            Map<?, ?> body = (Map<?, ?>) response.getBody();
            String idStr = (String) body.get("id");
            String email = (String) body.get("email");

            if (idStr == null) return null;
            UUID uuid = UUID.fromString(idStr);

            if (parameter.getParameterType().equals(UserSummary.class)) {
                return new UserSummary(uuid, email);
            }

            return uuid;
        }

        return null;
    }
}