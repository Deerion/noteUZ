package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.UserSecurity;
import org.example.noteuzbackend.model.enums.Role;
import org.example.noteuzbackend.repository.*;
import org.example.noteuzbackend.service.AdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe serwisu administracyjnego AdminService.
 * Weryfikują logikę banowania, nadawania uprawnień oraz walidację dostępu.
 */
@ExtendWith(MockitoExtension.class)
class AdminDashboardTest {

    @Mock private UserSecurityRepo securityRepo;
    @Mock private NoteRepo noteRepo;
    @Mock private GroupRepo groupRepo;
    @Mock private GroupMemberRepo groupMemberRepo;
    @Mock private AppUserRepo appUserRepo;

    @InjectMocks
    private AdminService adminService;

    /**
     * Testuje czy moderator może zablokować (zbanować) zwykłego użytkownika.
     */
    @Test
    void shouldToggleBanForUser() {
        // Given
        UUID targetId = UUID.randomUUID();
        UUID modId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setBanned(false);

        UserSecurity mod = new UserSecurity(modId);
        mod.setRole(Role.MODERATOR);

        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));
        when(securityRepo.findById(modId)).thenReturn(Optional.of(mod));

        adminService.toggleBan(targetId, modId);

        assertThat(target.isBanned())
                .as("Status zbanowania użytkownika powinien zmienić się na TRUE")
                .isTrue();

        verify(securityRepo).save(target);
    }

    /**
     * Testuje czy moderator nie może zablokować innego moderatora (oczekiwany błąd 403).
     */
    @Test
    void moderatorCannotBanAnotherModerator() {
        UUID targetId = UUID.randomUUID();
        UUID modId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setRole(Role.MODERATOR);
        UserSecurity mod = new UserSecurity(modId);
        mod.setRole(Role.MODERATOR);

        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));
        when(securityRepo.findById(modId)).thenReturn(Optional.of(mod));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            adminService.toggleBan(targetId, modId);
        });

        assertThat(exception.getStatusCode().value())
                .as("Kod błędu powinien wynosić 403 (Forbidden) przy próbie zbanowania innego moderatora")
                .isEqualTo(403);
    }

    /**
     * Testuje czy administrator może awansować użytkownika na moderatora.
     */
    @Test
    void shouldPromoteToModerator() {
        // Given
        UUID targetId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setRole(Role.USER);
        UserSecurity admin = new UserSecurity(adminId);
        admin.setRole(Role.ADMIN);

        when(securityRepo.findById(adminId)).thenReturn(Optional.of(admin));
        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));

        adminService.promoteToModerator(targetId, adminId);

        assertThat(target.getRole())
                .as("Rola użytkownika po awansie powinna wynosić MODERATOR")
                .isEqualTo(Role.MODERATOR);

        verify(securityRepo).save(target);
    }
}