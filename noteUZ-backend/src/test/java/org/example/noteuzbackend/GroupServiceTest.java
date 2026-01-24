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

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock private GroupRepo groupRepo;
    @Mock private GroupMemberRepo memberRepo;
    @Mock private AppUserRepo userRepo;
    @Mock private GroupInvitationRepo invitationRepo;

    @InjectMocks
    private GroupService groupService;

    @Test
    void shouldCreateGroupAndAssignOwner() {
        UUID creatorId = UUID.randomUUID();
        String name = "Nowa Grupa";
        Group savedGroup = new Group();
        savedGroup.setId(UUID.randomUUID());
        savedGroup.setName(name);

        when(groupRepo.save(any(Group.class))).thenReturn(savedGroup);

        Group result = groupService.createGroup(creatorId, name, "Opis");

        assertThat(result.getName()).isEqualTo(name);
        verify(memberRepo).save(argThat(member ->
                member.getUserId().equals(creatorId) && member.getRole() == GroupRole.OWNER
        ));
    }

    @Test
    void shouldInviteUserByEmail() {
        UUID groupId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        String email = "friend@example.com";
        UUID friendId = UUID.randomUUID();

        // Admin ma uprawnienia
        GroupMember adminMember = new GroupMember(groupId, adminId, GroupRole.ADMIN);
        when(memberRepo.findByGroupIdAndUserId(groupId, adminId)).thenReturn(Optional.of(adminMember));

        // Znaleziony user do zaproszenia
        AppUser friend = new AppUser();

        AppUser mockUser = mock(AppUser.class);
        when(mockUser.getId()).thenReturn(friendId);

        when(userRepo.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(memberRepo.existsByGroupIdAndUserId(groupId, friendId)).thenReturn(false);
        when(invitationRepo.existsByGroupIdAndInviteeId(groupId, friendId)).thenReturn(false);

        groupService.inviteUserByEmail(groupId, adminId, email);

        verify(invitationRepo).save(any());
    }

    @Test
    void shouldThrowExceptionWhenRemovingOwner() {
        UUID groupId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();

        GroupMember admin = new GroupMember(groupId, adminId, GroupRole.ADMIN);
        GroupMember owner = new GroupMember(groupId, ownerId, GroupRole.OWNER);

        when(memberRepo.findByGroupIdAndUserId(groupId, adminId)).thenReturn(Optional.of(admin));
        when(memberRepo.findByGroupIdAndUserId(groupId, ownerId)).thenReturn(Optional.of(owner));

        assertThrows(ResponseStatusException.class, () -> {
            groupService.removeMember(groupId, adminId, ownerId);
        });
    }
}
