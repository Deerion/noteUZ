package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteShare;
import org.example.noteuzbackend.model.entity.NoteVote;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.repository.NoteRepo;
import org.example.noteuzbackend.repository.NoteShareRepo;
import org.example.noteuzbackend.repository.NoteVoteRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepo noteRepo;
    private final NoteShareRepo shareRepo;
    private final AppUserRepo userRepo;
    private final NoteVoteRepo voteRepo; // <--- NOWE

    public NoteService(NoteRepo noteRepo, NoteShareRepo shareRepo, AppUserRepo userRepo, NoteVoteRepo voteRepo) {
        this.noteRepo = noteRepo;
        this.shareRepo = shareRepo;
        this.userRepo = userRepo;
        this.voteRepo = voteRepo;
    }

    // --- Helper do uzupełniania głosów ---
    /**
     * Wzbogaca obiekty notatek o aktualną liczbę głosów oraz informację, czy bieżący użytkownik oddał głos.
     * @param notes lista notatek do wzbogacenia
     * @param currentUserId identyfikator bieżącego użytkownika (może być null)
     */
    private void enrichWithVotes(List<Note> notes, UUID currentUserId) {
        if (notes == null || notes.isEmpty()) return;

        Optional<AppUser> userOpt = (currentUserId != null) ? userRepo.findById(currentUserId) : Optional.empty();

        for (Note note : notes) {
            note.setVoteCount(voteRepo.countByNote(note));
            if (userOpt.isPresent()) {
                note.setVotedByMe(voteRepo.existsByNoteAndUser(note, userOpt.get()));
            }
        }
    }

    // --- LISTING ---

    /**
     * Pobiera listę prywatnych notatek użytkownika (nieprzypisanych do żadnej grupy).
     * @param userId identyfikator użytkownika
     * @return lista notatek użytkownika
     */
    public List<Note> listNotes(UUID userId) {
        List<Note> notes = noteRepo.findByUserIdAndGroupIdIsNull(userId);
        enrichWithVotes(notes, userId);
        return notes;
    }

    /**
     * Pobiera listę notatek należących do konkretnej grupy.
     * @param groupId identyfikator grupy
     * @param userId identyfikator użytkownika żądającego (do sprawdzenia głosów)
     * @return lista notatek grupowych
     */
    public List<Note> listGroupNotes(UUID groupId, UUID userId) {
        List<Note> notes = noteRepo.findByGroupIdOrderByCreatedAtDesc(groupId);
        enrichWithVotes(notes, userId);
        return notes;
    }

    // Metoda legacy (dla kompatybilności)
    /**
     * Metoda legacy do pobierania notatek grupowych bez kontekstu użytkownika.
     * @param groupId identyfikator grupy
     * @return lista notatek grupowych
     */
    public List<Note> listGroupNotes(UUID groupId) {
        return listGroupNotes(groupId, null);
    }

    /**
     * Pobiera notatkę na podstawie jej identyfikatora.
     * @param id identyfikator notatki
     * @return obiekt notatki
     */
    public Note getNoteById(UUID id) {
        return getNoteById(id, null);
    }

    /**
     * Pobiera notatkę na podstawie jej identyfikatora wraz ze statystykami głosów.
     * @param id identyfikator notatki
     * @param userId identyfikator użytkownika żądającego
     * @return obiekt notatki
     */
    public Note getNoteById(UUID id, UUID userId) {
        Note note = noteRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notatka nie istnieje"));
        enrichWithVotes(Collections.singletonList(note), userId);
        return note;
    }

    // --- CRUD ---

    /**
     * Tworzy nową prywatną notatkę.
     * @param userId identyfikator autora
     * @param title tytuł notatki
     * @param content treść notatki
     * @return stworzona notatka
     */
    public Note create(UUID userId, String title, String content) {
        var note = new Note();
        note.setUserId(userId);
        note.setTitle(title);
        note.setContent(content);
        return noteRepo.save(note);
    }

    /**
     * Tworzy nową notatkę przypisaną do grupy.
     * @param groupId identyfikator grupy
     * @param userId identyfikator autora
     * @param title tytuł notatki
     * @param content treść notatki
     * @return stworzona notatka grupowa
     */
    public Note createGroupNote(UUID groupId, UUID userId, String title, String content) {
        var note = new Note();
        note.setGroupId(groupId);
        note.setUserId(userId);
        note.setTitle(title);
        note.setContent(content);
        return noteRepo.save(note);
    }

    /**
     * Aktualizuje tytuł i treść istniejącej notatki.
     * @param id identyfikator notatki
     * @param title nowy tytuł
     * @param content nowa treść
     * @return zaktualizowana notatka
     */
    public Note update(UUID id, String title, String content) {
        Note note = noteRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Notatka nie istnieje"));
        note.setTitle(title);
        note.setContent(content);
        note.setUpdatedAt(LocalDateTime.now());
        return noteRepo.save(note);
    }

    /**
     * Trwale usuwa notatkę wraz ze wszystkimi powiązanymi udostępnieniami i głosami.
     * @param id identyfikator notatki
     */
    @Transactional
    public void delete(UUID id) {
        // 1. Usuń udostępnienia
        List<NoteShare> shares = shareRepo.findAll().stream()
                .filter(s -> s.getNoteId().equals(id))
                .collect(Collectors.toList());
        shareRepo.deleteAll(shares);

        // 2. Usuń głosy
        voteRepo.deleteAllByNoteId(id);

        // 3. Usuń notatkę
        noteRepo.deleteById(id);
    }

    // --- NOWA FUNKCJONALNOŚĆ: GŁOSOWANIE ---

    /**
     * Przełącza głos użytkownika pod notatką (dodaje jeśli nie ma, usuwa jeśli już oddał).
     * @param noteId identyfikator notatki
     * @param userId identyfikator użytkownika
     * @return mapa z nowym licznikiem głosów i stanem głosu bieżącego użytkownika
     */
    @Transactional
    public Map<String, Object> toggleVote(UUID noteId, UUID userId) {
        AppUser user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Note note = noteRepo.findById(noteId).orElseThrow(() -> new RuntimeException("Note not found"));

        Optional<NoteVote> existingVote = voteRepo.findByNoteAndUser(note, user);

        if (existingVote.isPresent()) {
            voteRepo.delete(existingVote.get());
        } else {
            voteRepo.save(new NoteVote(note, user));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("voteCount", voteRepo.countByNote(note));
        result.put("votedByMe", existingVote.isEmpty());
        return result;
    }

    // --- UDOSTĘPNIANIE (BEZ ZMIAN) ---

    /**
     * Tworzy nowe udostępnienie notatki dla innego użytkownika (na podstawie adresu email).
     * Generuje unikalny token udostępnienia.
     * @param noteId identyfikator notatki
     * @param ownerId identyfikator właściciela notatki
     * @param recipientEmail email odbiorcy
     * @param permission poziom uprawnień
     * @return link do zaakceptowania udostępnienia
     */
    @Transactional
    public String createShare(UUID noteId, UUID ownerId, String recipientEmail, NoteShare.Permission permission) {
        Optional<AppUser> ownerOpt = userRepo.findById(ownerId);
        if (ownerOpt.isPresent()) {
            if (ownerOpt.get().getEmail().equalsIgnoreCase(recipientEmail)) {
                throw new IllegalArgumentException("Nie możesz udostępnić notatki samemu sobie.");
            }
        }

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

    /**
     * Zmienia uprawnienia dla istniejącego udostępnienia.
     * @param shareId identyfikator udostępnienia
     * @param newPermission nowy poziom uprawnień
     */
    public void updateSharePermission(UUID shareId, NoteShare.Permission newPermission) {
        NoteShare share = shareRepo.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Udostępnienie nie istnieje"));
        share.setPermission(newPermission);
        shareRepo.save(share);
    }

    /**
     * Cofa udostępnienie notatki.
     * @param shareId identyfikator udostępnienia
     */
    public void revokeShare(UUID shareId) {
        shareRepo.deleteById(shareId);
    }

    /**
     * Akceptuje zaproszenie do współdzielenia notatki na podstawie tokena.
     * @param shareToken token udostępnienia
     * @param recipientId identyfikator użytkownika akceptującego
     */
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

    /**
     * Pobiera listę notatek udostępnionych konkretnemu użytkownikowi.
     * @param recipientEmail email użytkownika
     * @param userId identyfikator użytkownika (do wzbogacenia o głosy)
     * @return lista map zawierających dane udostępnionych notatek
     */
    public List<Map<String, Object>> getSharedNotes(String recipientEmail, UUID userId) {
        List<NoteShare> shares = shareRepo.findAll().stream()
                .filter(s -> s.getRecipientEmail().equals(recipientEmail))
                .filter(s -> s.getStatus() != NoteShare.ShareStatus.REJECTED)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();

        Optional<AppUser> userOpt = (userId != null) ? userRepo.findById(userId) : Optional.empty();

        for (NoteShare share : shares) {
            try {
                Note note = noteRepo.findById(share.getNoteId()).orElse(null);
                if (note == null) continue;

                // Dodaj głosy
                long votes = voteRepo.countByNote(note);
                boolean voted = userOpt.isPresent() && voteRepo.existsByNoteAndUser(note, userOpt.get());

                Map<String, Object> map = new HashMap<>();
                map.put("id", note.getId());
                map.put("title", note.getTitle());
                map.put("content", note.getContent());
                map.put("createdAt", note.getCreatedAt());
                map.put("permission", share.getPermission().toString());
                map.put("ownerId", share.getOwnerId());
                map.put("status", share.getStatus().toString());
                map.put("token", share.getToken());
                map.put("voteCount", votes); // <---
                map.put("votedByMe", voted); // <---
                result.add(map);
            } catch (Exception e) {
                // ignore
            }
        }
        return result;
    }

    /**
     * Szuka udostępnienia dla danej notatki i adresu email.
     * @param noteId identyfikator notatki
     * @param email adres email odbiorcy
     * @return Optional z obiektem NoteShare
     */
    public Optional<NoteShare> findShare(UUID noteId, String email) {
        return shareRepo.findByNoteIdAndRecipientEmail(noteId, email);
    }

    /**
     * Pobiera listę wszystkich aktywnych udostępnień dla konkretnej notatki.
     * @param noteId identyfikator notatki
     * @return lista map z informacjami o udostępnieniach
     */
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