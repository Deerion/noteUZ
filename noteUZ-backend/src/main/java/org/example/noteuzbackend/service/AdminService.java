package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.*;
import org.example.noteuzbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final AppUserRepo userRepo;
    private final UserSecurityRepo securityRepo;
    private final NoteRepo noteRepo;
    private final GroupRepo groupRepo;
    // Dodaj inne repozytoria jeśli trzeba czyścić relacje ręcznie (np. GroupMemberRepo)

    public AdminService(AppUserRepo userRepo, UserSecurityRepo securityRepo, NoteRepo noteRepo, GroupRepo groupRepo) {
        this.userRepo = userRepo;
        this.securityRepo = securityRepo;
        this.noteRepo = noteRepo;
        this.groupRepo = groupRepo;
    }

    public boolean isAdmin(UUID userId) {
        return securityRepo.findById(userId)
                .map(UserSecurity::isAdmin)
                .orElse(false);
    }

    // --- UŻYTKOWNICY ---

    public List<Map<String, Object>> getAllUsers() {
        List<AppUser> users = userRepo.findAll();
        return users.stream().map(u -> {
            UserSecurity sec = securityRepo.findById(u.getId()).orElse(new UserSecurity(u.getId()));
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("displayName", u.getDisplayName());
            map.put("isAdmin", sec.isAdmin());
            map.put("isBanned", sec.isBanned());
            map.put("warningCount", sec.getWarningCount());
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void toggleBan(UUID userId) {
        UserSecurity sec = securityRepo.findById(userId).orElse(new UserSecurity(userId));
        sec.setBanned(!sec.isBanned());
        securityRepo.save(sec);
    }

    @Transactional
    public void toggleAdmin(UUID userId) {
        UserSecurity sec = securityRepo.findById(userId).orElse(new UserSecurity(userId));
        sec.setAdmin(!sec.isAdmin());
        securityRepo.save(sec);
    }

    @Transactional
    public void addWarning(UUID userId) {
        UserSecurity sec = securityRepo.findById(userId).orElse(new UserSecurity(userId));
        sec.setWarningCount(sec.getWarningCount() + 1);
        securityRepo.save(sec);
    }

    // NOWE: Usuwanie użytkownika
    @Transactional
    public void deleteUser(UUID userId) {
        // Uwaga: Jeśli masz klucze obce w bazie bez ON DELETE CASCADE,
        // musisz najpierw usunąć powiązane dane (notatki, członkostwa w grupach).
        // Zakładamy, że Hibernate/Baza to obsłuży lub usuwamy kluczowe:

        securityRepo.deleteById(userId);
        // Opcjonalnie: noteRepo.deleteAllByUserId(userId);
        userRepo.deleteById(userId);
    }

    // --- NOTATKI ---

    public List<Note> getAllNotes() {
        return noteRepo.findAll();
    }

    @Transactional
    public void deleteNote(UUID noteId) {
        noteRepo.deleteById(noteId);
    }

    // --- GRUPY ---

    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }

    @Transactional
    public void deleteGroup(UUID groupId) {
        groupRepo.deleteById(groupId);
    }

    @Transactional
    public void ensureUserSecurityExists(UUID userId) {
        if (!securityRepo.existsById(userId)) {
            securityRepo.save(new UserSecurity(userId));
        }
    }
}