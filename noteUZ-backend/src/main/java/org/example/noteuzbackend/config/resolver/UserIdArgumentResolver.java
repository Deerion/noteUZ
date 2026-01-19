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

@Component
public class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthService authService;
    private final String cookieName; // <--- Dodajemy pole na nazwę ciasteczka

    // Wstrzykujemy nazwę ciasteczka z konfiguracji (tak samo jak w AuthService)
    public UserIdArgumentResolver(AuthService authService,
                                  @Value("${app.jwt.cookie}") String cookieName) {
        this.authService = authService;
        this.cookieName = cookieName;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null
                && (parameter.getParameterType().equals(UUID.class) || parameter.getParameterType().equals(UserSummary.class));
    }

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