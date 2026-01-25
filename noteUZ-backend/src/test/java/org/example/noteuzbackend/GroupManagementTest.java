package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Group;
import org.example.noteuzbackend.model.entity.GroupMember;
import org.example.noteuzbackend.model.enums.GroupRole;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.repository.GroupInvitationRepo;
import org.example.noteuzbackend.repository.GroupMemberRepo;
import org.example.noteuzbackend.repository.GroupRepo;
import org.example.noteuzbackend.service.GroupService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe serwisu GroupService.
 * Weryfikują tworzenie grup, zapraszanie członków oraz zarządzanie nimi.
 */
@ExtendWith(MockitoExtension.class)
class GroupManagementTest {

    @Mock private GroupRepo groupRepo;
    @Mock private GroupMemberRepo memberRepo;
    @Mock private AppUserRepo userRepo;
    @Mock private GroupInvitationRepo invitationRepo;

    @InjectMocks
    private GroupService groupService;

    /**
     * Testuje tworzenie nowej grupy i automatyczne przypisanie twórcy jako właściciela.
     */
    @Test
    void shouldCreateGroupAndAssignOwner() {
        UUID creatorId = UUID.randomUUID();
        String name = "Nowa Grupa";
        Group savedGroup = new Group();
        savedGroup.setId(UUID.randomUUID());
        savedGroup.setName(name);

        when(groupRepo.save(any(Group.class))).thenReturn(savedGroup);

        Group result = groupService.createGroup(creatorId, name, "Opis");

        assertThat(result.getName())
                .as("Nazwa utworzonej grupy powinna być identyczna z podaną na wejściu")
                .isEqualTo(name);

        verify(memberRepo).save(argThat(member ->
                member.getUserId().equals(creatorId) && member.getRole() == GroupRole.OWNER
        ));
    }

    /**
     * Testuje zapraszanie użytkownika do grupy na podstawie adresu email.
     */
    @Test
    void shouldInviteUserByEmail() {
        // Given
        UUID groupId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        String email = "friend@example.com";
        UUID friendId = UUID.randomUUID();

        GroupMember adminMember = new GroupMember(groupId, adminId, GroupRole.ADMIN);
        when(memberRepo.findByGroupIdAndUserId(groupId, adminId)).thenReturn(Optional.of(adminMember));

        AppUser mockUser = mock(AppUser.class);
        when(mockUser.getId()).thenReturn(friendId);

        when(userRepo.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(memberRepo.existsByGroupIdAndUserId(groupId, friendId)).thenReturn(false);
        when(invitationRepo.existsByGroupIdAndInviteeId(groupId, friendId)).thenReturn(false);

        // When
        groupService.inviteUserByEmail(groupId, adminId, email);

        // Then
        verify(invitationRepo).save(any());
    }

    /**
     * Testuje czy system uniemożliwia usunięcie właściciela z grupy.
     */
    @Test
    void shouldThrowExceptionWhenRemovingOwner() {
        // Given
        UUID groupId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        GroupMember admin = new GroupMember(groupId, adminId, GroupRole.ADMIN);
        GroupMember owner = new GroupMember(groupId, ownerId, GroupRole.OWNER);

        when(memberRepo.findByGroupIdAndUserId(groupId, adminId)).thenReturn(Optional.of(admin));
        when(memberRepo.findByGroupIdAndUserId(groupId, ownerId)).thenReturn(Optional.of(owner));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            groupService.removeMember(groupId, adminId, ownerId);
        });

        assertThat(ex.getMessage())
                .as("Komunikat błędu powinien informować o braku możliwości usunięcia właściciela")
                .contains("Nie możesz usunąć Właściciela");
    }
}