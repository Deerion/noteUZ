package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Group;
import org.example.noteuzbackend.model.entity.GroupInvitation;
import org.example.noteuzbackend.model.entity.GroupMember;
import org.example.noteuzbackend.model.enums.GroupRole;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.repository.GroupInvitationRepo;
import org.example.noteuzbackend.repository.GroupMemberRepo;
import org.example.noteuzbackend.repository.GroupRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Serwis zarządzający grupami użytkowników.
 */
@Service
public class GroupService {

    private final GroupRepo groupRepo;
    private final GroupMemberRepo memberRepo;
    private final AppUserRepo userRepo;
    private final GroupInvitationRepo invitationRepo;

    /**
     * Konstruktor serwisu.
     * @param groupRepo Repozytorium grup
     * @param memberRepo Repozytorium członków grup
     * @param userRepo Repozytorium użytkowników
     * @param invitationRepo Repozytorium zaproszeń do grup
     */
    public GroupService(GroupRepo groupRepo, GroupMemberRepo memberRepo, AppUserRepo userRepo, GroupInvitationRepo invitationRepo) {
        this.groupRepo = groupRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.invitationRepo = invitationRepo;
    }

    // 1. TWORZENIE GRUPY
    /**
     * Tworzy nową grupę i przypisuje twórcę jako jej właściciela.
     * @param creatorId identyfikator twórcy grupy
     * @param name nazwa grupy
     * @param description opis grupy
     * @return stworzony obiekt grupy
     */
    @Transactional
    public Group createGroup(UUID creatorId, String name, String description) {
        Group group = new Group();
        group.setName(name);
        group.setDescription(description);
        Group savedGroup = groupRepo.save(group);

        GroupMember owner = new GroupMember(savedGroup.getId(), creatorId, GroupRole.OWNER);
        memberRepo.save(owner);

        return savedGroup;
    }

    // 2. LISTA GRUP UŻYTKOWNIKA
    /**
     * Pobiera listę grup, do których należy użytkownik.
     * @param userId identyfikator użytkownika
     * @return lista map zawierających szczegóły członkostwa w grupach
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserGroups(UUID userId) {
        List<GroupMember> memberships = memberRepo.findByUserId(userId);

        return memberships.stream().map(m -> {
            Group g = groupRepo.findById(m.getGroupId()).orElse(null);
            if (g == null) return null;

            // Tutaj też warto dodać jawne typowanie dla bezpieczeństwa
            return Map.<String, Object>of(
                    "groupId", g.getId(),
                    "groupName", g.getName(),
                    "description", g.getDescription() != null ? g.getDescription() : "",
                    "myRole", m.getRole(),
                    "joinedAt", m.getJoinedAt()
            );
        }).filter(item -> item != null).collect(Collectors.toList());
    }

    /**
     * Weryfikuje, czy użytkownik ma uprawnienia administracyjne w grupie (OWNER lub ADMIN).
     * @param groupId identyfikator grupy
     * @param requesterId identyfikator użytkownika sprawdzanego
     * @return obiekt GroupMember jeśli weryfikacja przebiegła pomyślnie
     * @throws ResponseStatusException jeśli użytkownik nie należy do grupy lub nie ma uprawnień (403)
     */
    private GroupMember validateAdminAccess(UUID groupId, UUID requesterId) {
        GroupMember member = memberRepo.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie należysz do tej grupy"));

        if (member.getRole() == GroupRole.MEMBER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień administratora");
        }
        return member;
    }

    // 3. ZAPRASZANIE CZŁONKA
    /**
     * Zaprasza użytkownika do grupy na podstawie jego adresu email.
     * @param groupId identyfikator grupy
     * @param requesterId identyfikator osoby zapraszającej
     * @param targetEmail email osoby zapraszanej
     * @throws ResponseStatusException jeśli użytkownik nie istnieje (404) lub zapraszający nie ma uprawnień (403)
     */
    @Transactional
    public void inviteUserByEmail(UUID groupId, UUID requesterId, String targetEmail) {
        validateAdminAccess(groupId, requesterId);

        AppUser targetUser = userRepo.findByEmail(targetEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik o podanym emailu nie istnieje."));

        UUID targetUserId = targetUser.getId();

        if (memberRepo.existsByGroupIdAndUserId(groupId, targetUserId)) return;
        if (invitationRepo.existsByGroupIdAndInviteeId(groupId, targetUserId)) return;

        GroupInvitation invitation = new GroupInvitation(groupId, requesterId, targetUserId);
        invitationRepo.save(invitation);
    }

    // 4. POBIERANIE ZAPROSZEŃ
    /**
     * Pobiera listę zaproszeń do grup dla konkretnego użytkownika.
     * @param userId identyfikator użytkownika
     * @return lista map z informacjami o zaproszeniach
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserInvitations(UUID userId) {
        return invitationRepo.findByInviteeId(userId).stream().map(inv -> {
            Group g = groupRepo.findById(inv.getGroupId()).orElse(null);
            if (g == null) return null;

            String inviterName = userRepo.findById(inv.getInviterId())
                    .map(AppUser::getDisplayName).orElse("Użytkownik");

            return Map.<String, Object>of(
                    "invitationId", inv.getId(),
                    "groupId", g.getId(),
                    "groupName", g.getName(),
                    "inviterName", inviterName,
                    "sentAt", inv.getCreatedAt()
            );
        }).filter(item -> item != null).collect(Collectors.toList());
    }

    // 5. ODPOWIEDŹ NA ZAPROSZENIE
    /**
     * Pozwala użytkownikowi zaakceptować lub odrzucić zaproszenie do grupy.
     * @param invitationId identyfikator zaproszenia
     * @param userId identyfikator użytkownika odpowiadającego
     * @param accept true jeśli akceptuje, false jeśli odrzuca
     * @throws ResponseStatusException jeśli zaproszenie nie istnieje (404)
     */
    @Transactional
    public void respondToInvitation(UUID invitationId, UUID userId, boolean accept) {
        GroupInvitation inv = invitationRepo.findByIdAndInviteeId(invitationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zaproszenie nie istnieje"));

        if (accept) {
            GroupMember newMember = new GroupMember(inv.getGroupId(), userId, GroupRole.MEMBER);
            memberRepo.save(newMember);
        }
        invitationRepo.delete(inv);
    }

    // 6. USUWANIE CZŁONKA
    /**
     * Usuwa członka z grupy lub pozwala członkowi na jej opuszczenie.
     * @param groupId identyfikator grupy
     * @param requesterId identyfikator osoby wykonującej akcję
     * @param targetUserId identyfikator osoby usuwanej
     * @throws ResponseStatusException przy braku uprawnień (403), gdy użytkownik nie jest w grupie (404) lub gdy właściciel próbuje odejść (400)
     */
    @Transactional
    public void removeMember(UUID groupId, UUID requesterId, UUID targetUserId) {
        GroupMember requester = memberRepo.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie należysz do grupy"));

        GroupMember target = memberRepo.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik nie jest w grupie"));

        if (requesterId.equals(targetUserId)) {
            if (target.getRole() == GroupRole.OWNER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Właściciel nie może opuścić grupy (musi ją usunąć).");
            }
            memberRepo.delete(target);
            return;
        }

        if (requester.getRole() == GroupRole.MEMBER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień do usuwania członków");
        }
        if (target.getRole() == GroupRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie możesz usunąć Właściciela.");
        }
        if (requester.getRole() == GroupRole.ADMIN && target.getRole() == GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie możesz usunąć innego Administratora.");
        }
        memberRepo.delete(target);
    }

    // 7. ZMIANA ROLI
    /**
     * Zmienia rolę członka w grupie.
     * @param groupId identyfikator grupy
     * @param requesterId identyfikator osoby wykonującej akcję
     * @param targetUserId identyfikator osoby, której rola jest zmieniana
     * @param newRoleStr nazwa nowej roli (np. "ADMIN", "MEMBER")
     * @throws ResponseStatusException przy błędnej roli (400) lub braku uprawnień (403)
     */
    @Transactional
    public void changeRole(UUID groupId, UUID requesterId, UUID targetUserId, String newRoleStr) {
        GroupMember requester = validateAdminAccess(groupId, requesterId);
        GroupMember target = memberRepo.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik nie jest w grupie"));

        GroupRole newRole;
        try {
            newRole = GroupRole.valueOf(newRoleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowa rola");
        }

        if (newRole == GroupRole.OWNER && requester.getRole() != GroupRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tylko Właściciel może nadać rolę OWNER");
        }
        if (requester.getRole() == GroupRole.ADMIN && target.getRole() == GroupRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie możesz edytować Właściciela");
        }
        target.setRole(newRole);
        memberRepo.save(target);
    }

    // 8. SZCZEGÓŁY GRUPY (ZMODYFIKOWANA METODA)
    /**
     * Pobiera szczegółowe informacje o grupie wraz z listą jej członków i ich danymi profilowymi.
     * @param groupId identyfikator grupy
     * @param requesterId identyfikator użytkownika żądającego
     * @return mapa zawierająca obiekt grupy oraz listę wzbogaconych członków
     * @throws ResponseStatusException jeśli grupa nie istnieje (404) lub użytkownik nie ma do niej dostępu (403)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGroupDetails(UUID groupId, UUID requesterId) {
        memberRepo.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak dostępu do grupy"));

        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        List<GroupMember> members = memberRepo.findByGroupId(groupId);

        List<Map<String, Object>> enrichedMembers = members.stream().map(m -> {
            String displayName = "Użytkownik";
            String email = "";

            var userOpt = userRepo.findById(m.getUserId());
            if (userOpt.isPresent()) {
                displayName = userOpt.get().getDisplayName();
                email = userOpt.get().getEmail();
            }

            if (displayName == null) displayName = "Użytkownik";
            if (email == null) email = "";

            // --- POPRAWKA TUTAJ: Jawne wskazanie typów <String, Object> ---
            return Map.<String, Object>of(
                    "id", m.getId(),
                    "groupId", m.getGroupId(),
                    "userId", m.getUserId(),
                    "role", m.getRole(),
                    "joinedAt", m.getJoinedAt(),
                    "displayName", displayName,
                    "email", email
            );
        }).collect(Collectors.toList());

        return Map.of(
                "group", group,
                "members", enrichedMembers
        );
    }
}