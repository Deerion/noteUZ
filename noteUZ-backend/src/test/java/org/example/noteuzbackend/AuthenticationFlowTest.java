package org.example.noteuzbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.noteuzbackend.controller.AuthController;
import org.example.noteuzbackend.dto.AuthRequests.LoginRequest;
import org.example.noteuzbackend.dto.AuthRequests.RegisterRequest;
import org.example.noteuzbackend.service.AdminService;
import org.example.noteuzbackend.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testy integracyjne (WebMvcTest) przepływu autentykacji i rejestracji.
 * Weryfikują działanie AuthController przy użyciu MockMvc.
 */
@WebMvcTest(AuthController.class)
class AuthenticationFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private AdminService adminService;

    /**
     * Testuje czy użytkownik może się zalogować przy podaniu poprawnych danych i tokena CAPTCHA.
     * @throws Exception w przypadku błędu MockMvc
     */
    @Test
    @WithMockUser
    void shouldLoginSpecificUser() throws Exception {
        // Given
        String email = "test12345@example.com";
        String password = "Test12345";
        String fakeCaptchaToken = "mock-captcha-token";

        LoginRequest loginRequest = new LoginRequest(email, password, fakeCaptchaToken);

        when(authService.verifyCaptcha(fakeCaptchaToken))
                .thenReturn((ResponseEntity) ResponseEntity.ok(Map.of("success", true)));

        when(authService.signIn(email, password))
                .thenReturn((ResponseEntity) ResponseEntity.ok(Map.of("authenticated", true, "access_token", "xyz")));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true));

        verify(authService).signIn(eq(email), eq(password));
    }

    /**
     * Testuje proces rejestracji nowego użytkownika wraz z walidacją CAPTCHA.
     * @throws Exception w przypadku błędu MockMvc
     */
    @Test
    @WithMockUser
    void shouldRegisterNewUser() throws Exception {
        // Given
        String email = "nowy@example.com";
        String password = "Haslo123!";
        String displayName = "NowyUser";
        String fakeCaptchaToken = "mock-captcha-token";

        RegisterRequest registerRequest = new RegisterRequest(email, password, displayName, fakeCaptchaToken);

        when(authService.verifyCaptcha(fakeCaptchaToken))
                .thenReturn((ResponseEntity) ResponseEntity.ok(Map.of("success", true)));

        when(authService.register(email, password, displayName))
                .thenReturn((ResponseEntity) ResponseEntity.ok(Map.of("registered", true)));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registered").value(true));

        verify(authService).register(eq(email), eq(password), eq(displayName));
    }
}