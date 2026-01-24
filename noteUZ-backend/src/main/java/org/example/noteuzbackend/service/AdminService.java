package org.example.noteuzbackend.service;

import org.example.noteuzbackend.dto.AdminGroupDTO;
import org.example.noteuzbackend.dto.AdminNoteDTO;
import org.example.noteuzbackend.dto.AdminUserDTO;
import org.example.noteuzbackend.model.entity.*;
import org.example.noteuzbackend.model.enums.GroupRole;
import org.example.noteuzbackend.model.enums.Role;
import org.example.noteuzbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId; // <--- WAŻNY IMPORT
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserSecurityRepo securityRepo;
    private final NoteRepo noteRepo;
    private final GroupRepo groupRepo;
    private final GroupMemberRepo groupMemberRepo;
    private final AppUserRepo appUserRepo;

    public AdminService(UserSecurityRepo securityRepo, NoteRepo noteRepo, GroupRepo groupRepo, GroupMemberRepo groupMemberRepo, AppUserRepo appUserRepo) {
        this.securityRepo = securityRepo;
        this.noteRepo = noteRepo;
        this.groupRepo = groupRepo;
        this.groupMemberRepo = groupMemberRepo;
        this.appUserRepo = appUserRepo;
    }

    // --- Helpery ---

    public boolean isAtLeastModerator(UUID userId) {
        return securityRepo.findById(userId)
                .map(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.MODERATOR)
                .orElse(false);
    }

    public boolean isAdmin(UUID userId) {
        return securityRepo.findById(userId)
                .map(u -> u.getRole() == Role.ADMIN)
                .orElse(false);
    }

    public void ensureAdmin(UUID userId) {
        if (!isAdmin(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wymagane uprawnienia Administratora.");
        }
    }

    public void ensureAtLeastModerator(UUID userId) {
        if (!isAtLeastModerator(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień (wymagany Moderator).");
        }
    }

    public int getWarningCount(UUID userId) {
        return securityRepo.findById(userId)
                .map(UserSecurity::getWarnings)
                .orElse(0);
    }

    // --- Metody dla Kontrolera ---

    public List<AdminUserDTO> getAllUsers() {
        List<UserSecurity> securities = securityRepo.findAll();
        List<AppUser> profiles = appUserRepo.findAll();
        Map<UUID, AppUser> profilesMap = profiles.stream()
                .collect(Collectors.toMap(AppUser::getId, p -> p, (a, b) -> a));

        return securities.stream().map(sec -> {
            AppUser profile = profilesMap.get(sec.getId());
            String name = (profile != null && profile.getDisplayName() != null) ? profile.getDisplayName() : "Brak nazwy";
            String email = (profile != null && profile.getEmail() != null) ? profile.getEmail() : "Brak emaila";

            return new AdminUserDTO(
                    sec.getId(),
                    email,
                    sec.getRole(),
                    sec.isBanned(),
                    sec.getWarnings(),
                    name
            );
        }).collect(Collectors.toList());
    }

    public List<AdminNoteDTO> getAllNotes() {
        List<Note> notes = noteRepo.findAll();
        List<AppUser> users = appUserRepo.findAll();
        List<Group> groups = groupRepo.findAll();

        // --- POPRAWKA TUTAJ ---
        // Zabezpieczenie przed nullem w display_name (u.getDisplayName() != null ? ... : "...")
        Map<UUID, String> userNames = users.stream()
                .collect(Collectors.toMap(
                        AppUser::getId,
                        u -> u.getDisplayName() != null ? u.getDisplayName() : "Brak nazwy", // <--- TO NAPRAWIA BŁĄD 500
                        (a, b) -> a
                ));

        Map<UUID, String> groupNames = groups.stream()
                .collect(Collectors.toMap(
                        Group::getId,
                        g -> g.getName() != null ? g.getName() : "Bez nazwy", // <--- Tu też warto dodać dla bezpieczeństwa
                        (a, b) -> a
                ));

        return notes.stream().map(note -> {
            String author = userNames.getOrDefault(note.getUserId(), "Nieznany (ID: " + note.getUserId() + ")");
            String group = (note.getGroupId() != null) ? groupNames.getOrDefault(note.getGroupId(), "Usunięta grupa") : null;

            return new AdminNoteDTO(
                    note.getId(),
                    note.getTitle(),
                    note.getContent(),
                    note.getCreatedAt(),
                    author,
                    group,
                    note.getGroupId() != null
            );
        }).collect(Collectors.toList());
    }

    // --- ZAKTUALIZOWANA METODA: Grupy z pełnymi danymi (NAPRAWIONA DATA) ---
    public List<AdminGroupDTO> getAllGroups() {
        List<Group> groups = groupRepo.findAll();
        List<GroupMember> allMembers = groupMemberRepo.findAll();
        List<Note> allNotes = noteRepo.findAll();
        List<AppUser> allUsers = appUserRepo.findAll();

        Map<UUID, AppUser> userMap = allUsers.stream()
                .collect(Collectors.toMap(AppUser::getId, u -> u));

        return groups.stream().map(group -> {
            // Filtrujemy członków tej grupy
            List<GroupMember> groupMembers = allMembers.stream()
                    .filter(m -> m.getGroupId().equals(group.getId()))
                    .collect(Collectors.toList());

            // Liczymy notatki w tej grupie
            long noteCount = allNotes.stream()
                    .filter(n -> group.getId().equals(n.getGroupId()))
                    .count();

            // Szukamy właściciela
            GroupMember ownerMember = groupMembers.stream()
                    .filter(m -> m.getRole() == GroupRole.OWNER)
                    .findFirst()
                    .orElse(null);

            String ownerName = "Nieznany";
            String ownerEmail = "";

            if (ownerMember != null && userMap.containsKey(ownerMember.getUserId())) {
                AppUser ownerAppUser = userMap.get(ownerMember.getUserId());
                ownerName = ownerAppUser.getDisplayName();
                ownerEmail = ownerAppUser.getEmail();
            }

            // Tworzymy listę członków do podglądu
            List<AdminGroupDTO.GroupMemberDTO> memberList = groupMembers.stream()
                    .map(m -> {
                        AppUser u = userMap.get(m.getUserId());
                        return new AdminGroupDTO.GroupMemberDTO(
                                u != null ? u.getDisplayName() : "Nieznany",
                                u != null ? u.getEmail() : "",
                                m.getRole().name()
                        );
                    }).collect(Collectors.toList());

            // NAPRAWA BŁĘDU KOMPILACJI: Konwersja Instant -> LocalDateTime
            LocalDateTime createdDate = group.getCreatedAt() != null
                    ? LocalDateTime.ofInstant(group.getCreatedAt(), ZoneId.of("UTC"))
                    : LocalDateTime.now();

            return new AdminGroupDTO(
                    group.getId(),
                    group.getName(),
                    group.getDescription(),
                    ownerName,
                    ownerEmail,
                    groupMembers.size(),
                    (int) noteCount,
                    createdDate,
                    memberList
            );
        }).collect(Collectors.toList());
    }

    // --- Reszta metod akcji ---

    public void promoteToModerator(UUID targetId, UUID adminId) {
        ensureAdmin(adminId);
        UserSecurity target = securityRepo.findById(targetId).orElseThrow();
        if (target.getRole() == Role.ADMIN) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Już jest Adminem.");
        target.setRole(Role.MODERATOR);
        securityRepo.save(target);
    }

    public void demoteToUser(UUID targetId, UUID adminId) {
        ensureAdmin(adminId);
        UserSecurity target = securityRepo.findById(targetId).orElseThrow();
        if (target.getRole() == Role.ADMIN) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie ruszaj Admina.");
        target.setRole(Role.USER);
        securityRepo.save(target);
    }

    public void toggleBan(UUID targetId, UUID actorId) {
        ensureAtLeastModerator(actorId);
        UserSecurity target = securityRepo.findById(targetId).orElseThrow();
        UserSecurity actor = securityRepo.findById(actorId).orElseThrow();

        if (target.getRole() == Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if (actor.getRole() == Role.MODERATOR && target.getRole() == Role.MODERATOR) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        target.setBanned(!target.isBanned());
        securityRepo.save(target);
    }

    public void addWarning(UUID targetId, UUID actorId) {
        ensureAtLeastModerator(actorId);
        UserSecurity target = securityRepo.findById(targetId).orElseThrow();
        if (target.getRole() == Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        target.setWarnings(target.getWarnings() + 1);
        securityRepo.save(target);
    }

    public void removeWarning(UUID targetId, UUID actorId) {
        ensureAtLeastModerator(actorId);
        UserSecurity target = securityRepo.findById(targetId).orElseThrow();
        if (target.getWarnings() > 0) {
            target.setWarnings(target.getWarnings() - 1);
            securityRepo.save(target);
        }
    }

    public void deleteNote(UUID id) { noteRepo.deleteById(id); }

    public void deleteGroup(UUID id) { groupRepo.deleteById(id); }

    public void deleteUser(UUID targetId, UUID actorId) {
        ensureAdmin(actorId);
        UserSecurity target = securityRepo.findById(targetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (target.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie można usunąć Admina.");
        }
        securityRepo.deleteAuthUser(targetId);
    }
}