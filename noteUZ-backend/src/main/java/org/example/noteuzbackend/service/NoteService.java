package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteShare;
import org.example.noteuzbackend.repository.NoteRepo;
import org.example.noteuzbackend.repository.NoteShareRepo;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.model.entity.AppUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepo noteRepo;
    private final NoteShareRepo shareRepo;
    private final AppUserRepo userRepo;

    public NoteService(NoteRepo noteRepo, NoteShareRepo shareRepo, AppUserRepo userRepo) {
        this.noteRepo = noteRepo;
        this.shareRepo = shareRepo;
        this.userRepo = userRepo;
    }

    public List<Note> listNotes(UUID userId) {
        return noteRepo.findByUserIdAndGroupIdIsNull(userId);
    }

    public List<Note> listGroupNotes(UUID groupId) {
        return noteRepo.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    public Note getNoteById(UUID id) {
        return noteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notatka nie istnieje"));
    }

    public Note create(UUID userId, String title, String content) {
        var note = new Note();
        note.setUserId(userId);
        note.setTitle(title);
        note.setContent(content);
        return noteRepo.save(note);
    }

    public Note createGroupNote(UUID groupId, UUID userId, String title, String content) {
        var note = new Note();
        note.setGroupId(groupId);
        note.setUserId(userId);
        note.setTitle(title);
        note.setContent(content);
        return noteRepo.save(note);
    }

    public Note update(UUID id, String title, String content) {
        var note = getNoteById(id);
        note.setTitle(title);
        note.setContent(content);
        return noteRepo.save(note);
    }

    @Transactional
    public void delete(UUID id) {
        List<NoteShare> shares = shareRepo.findAll().stream()
                .filter(s -> s.getNoteId().equals(id))
                .collect(Collectors.toList());
        shareRepo.deleteAll(shares);
        noteRepo.deleteById(id);
    }

    @Transactional
    public String createShare(UUID noteId, UUID ownerId, String recipientEmail, NoteShare.Permission permission) {
        // 1. Walidacja: Właściciel nie może udostępnić sobie
        Optional<AppUser> ownerOpt = userRepo.findById(ownerId);
        if (ownerOpt.isPresent()) {
            if (ownerOpt.get().getEmail().equalsIgnoreCase(recipientEmail)) {
                throw new IllegalArgumentException("Nie możesz udostępnić notatki samemu sobie.");
            }
        }

        // 2. Sprawdź czy już istnieje
        Optional<NoteShare> existing = shareRepo.findByNoteIdAndRecipientEmail(noteId, recipientEmail);

        if (existing.isPresent()) {
            NoteShare share = existing.get();
            share.setPermission(permission);
            if (share.getStatus() == NoteShare.ShareStatus.REJECTED) {
                share.setStatus(NoteShare.ShareStatus.PENDING);
            }
            shareRepo.save(share);
            return "http://localhost:3000/notes/shared?token=" + share.getToken();
        }

        // 3. Utwórz nowe
        NoteShare share = new NoteShare();
        share.setNoteId(noteId);
        share.setOwnerId(ownerId);
        share.setRecipientEmail(recipientEmail);
        share.setToken(UUID.randomUUID().toString());
        share.setStatus(NoteShare.ShareStatus.PENDING);
        share.setPermission(permission);

        shareRepo.save(share);

        return "http://localhost:3000/notes/shared?token=" + share.getToken();
    }

    public void updateSharePermission(UUID shareId, NoteShare.Permission newPermission) {
        NoteShare share = shareRepo.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Udostępnienie nie istnieje"));
        share.setPermission(newPermission);
        shareRepo.save(share);
    }

    public void revokeShare(UUID shareId) {
        shareRepo.deleteById(shareId);
    }

    @Transactional
    public void acceptShare(UUID shareToken, UUID recipientId) {
        NoteShare share = shareRepo.findByToken(shareToken.toString())
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy token udostępnienia"));

        if (share.getStatus() == NoteShare.ShareStatus.REJECTED) {
            throw new IllegalArgumentException("To udostępnienie zostało odrzucone.");
        }

        share.setRecipientId(recipientId);
        share.setStatus(NoteShare.ShareStatus.ACCEPTED);
        shareRepo.save(share);
    }

    public List<Map<String, Object>> getSharedNotes(String recipientEmail) {
        List<NoteShare> shares = shareRepo.findAll().stream()
                .filter(s -> s.getRecipientEmail().equals(recipientEmail))
                .filter(s -> s.getStatus() != NoteShare.ShareStatus.REJECTED)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (NoteShare share : shares) {
            try {
                Note note = getNoteById(share.getNoteId());
                Map<String, Object> map = new HashMap<>();
                map.put("id", note.getId());
                map.put("title", note.getTitle());
                map.put("content", note.getContent());
                map.put("createdAt", note.getCreatedAt());
                map.put("permission", share.getPermission().toString());
                map.put("ownerId", share.getOwnerId());
                map.put("status", share.getStatus().toString());
                map.put("token", share.getToken());
                result.add(map);
            } catch (Exception e) {
                // Ignore if note deleted
            }
        }
        return result;
    }

    public Optional<NoteShare> findShare(UUID noteId, String email) {
        return shareRepo.findByNoteIdAndRecipientEmail(noteId, email);
    }

    public List<Map<String, Object>> getNoteShares(UUID noteId) {
        List<NoteShare> shares = shareRepo.findAll().stream()
                .filter(s -> s.getNoteId().equals(noteId))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (NoteShare s : shares) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("email", s.getRecipientEmail());
            map.put("status", s.getStatus().toString());
            map.put("permission", s.getPermission().toString());
            map.put("token", s.getToken());
            result.add(map);
        }
        return result;
    }
}