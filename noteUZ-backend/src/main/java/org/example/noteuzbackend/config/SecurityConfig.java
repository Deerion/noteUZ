package org.example.noteuzbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Konfiguracja bezpieczeństwa aplikacji.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Konfiguruje filtr bezpieczeństwa HTTP.
     * @param http Konfiguracja HTTPSecurity.
     * @return Skonfigurowany SecurityFilterChain.
     * @throws Exception W przypadku błędu konfiguracji.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                // DODANO: Konfiguracja uprawnień
                .authorizeHttpRequests(auth -> auth
                        // Zezwól na dostęp do wszystkich endpointów API i Auth
                        .requestMatchers("/api/**").permitAll()
                        // Zezwól na wszystko inne (opcjonalnie, dla celów deweloperskich)
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    /**
     * Konfiguruje źródło konfiguracji CORS.
     * @return Źródło konfiguracji CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Upewnij się, że adres Twojego frontendu jest tutaj poprawny
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Location"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}