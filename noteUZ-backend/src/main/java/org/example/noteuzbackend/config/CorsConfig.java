package org.example.noteuzbackend.config;

import org.example.noteuzbackend.config.resolver.UserIdArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Konfiguracja CORS dla aplikacji.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final UserIdArgumentResolver userIdArgumentResolver;

    /**
     * Konstruktor klasy konfiguracji CORS.
     * @param userIdArgumentResolver Resolver identyfikatora użytkownika.
     */
    public CorsConfig(UserIdArgumentResolver userIdArgumentResolver) {
        this.userIdArgumentResolver = userIdArgumentResolver;
    }

    /**
     * Dodaje konfigurację CORS.
     * @param registry Rejestr CORS do konfiguracji.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Location")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Dodaje resolver argumentów do obsługi identyfikatora użytkownika.
     * @param resolvers Lista resolverów argumentów do rozszerzenia.
     */
    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(userIdArgumentResolver);
    }
}