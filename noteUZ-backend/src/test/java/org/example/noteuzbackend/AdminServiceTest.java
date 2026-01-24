package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.AppUser;
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

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserSecurityRepo securityRepo;
    @Mock private NoteRepo noteRepo;
    @Mock private GroupRepo groupRepo;
    @Mock private GroupMemberRepo groupMemberRepo;
    @Mock private AppUserRepo appUserRepo;

    @InjectMocks
    private AdminService adminService;

    @Test
    void shouldToggleBanForUser() {
        UUID targetId = UUID.randomUUID();
        UUID modId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setBanned(false);

        UserSecurity mod = new UserSecurity(modId);
        mod.setRole(Role.MODERATOR);

        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));
        when(securityRepo.findById(modId)).thenReturn(Optional.of(mod));

        adminService.toggleBan(targetId, modId);

        assertThat(target.isBanned()).isTrue();
        verify(securityRepo).save(target);
    }

    @Test
    void moderatorCannotBanAnotherModerator() {
        UUID targetId = UUID.randomUUID();
        UUID modId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setRole(Role.MODERATOR); // Cel jest moderatorem

        UserSecurity mod = new UserSecurity(modId);
        mod.setRole(Role.MODERATOR); // Aktor też

        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));
        when(securityRepo.findById(modId)).thenReturn(Optional.of(mod));

        assertThrows(ResponseStatusException.class, () -> {
            adminService.toggleBan(targetId, modId);
        });
    }

    @Test
    void shouldPromoteToModerator() {
        UUID targetId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();

        UserSecurity target = new UserSecurity(targetId);
        target.setRole(Role.USER);

        UserSecurity admin = new UserSecurity(adminId);
        admin.setRole(Role.ADMIN);

        when(securityRepo.findById(adminId)).thenReturn(Optional.of(admin)); // Sprawdzenie uprawnień
        when(securityRepo.findById(targetId)).thenReturn(Optional.of(target));

        adminService.promoteToModerator(targetId, adminId);

        assertThat(target.getRole()).isEqualTo(Role.MODERATOR);
        verify(securityRepo).save(target);
    }
}
