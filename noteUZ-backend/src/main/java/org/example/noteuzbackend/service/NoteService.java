package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.NoteRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepo repo;

    public NoteService(NoteRepo repo) {
        this.repo = repo;
    }

    // 1. Notatki prywatne użytkownika
    @Transactional(readOnly = true)
    public List<Note> listNotes(UUID userId) {
        return repo.findByUserId(userId);
    }

    // 2. NOWE: Notatki grupowe
    @Transactional(readOnly = true)
    public List<Note> listGroupNotes(UUID groupId) {
        return repo.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    @Transactional(readOnly = true)
    public Note getNoteById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notatka o podanym ID nie istnieje."));
    }

    // 3. Tworzenie notatki prywatnej
    @Transactional
    public Note create(UUID userId, String title, String content) {
        return createGroupNote(userId, null, title, content);
    }

    // 4. NOWE: Tworzenie notatki grupowej (lub prywatnej jeśli groupId == null)
    @Transactional
    public Note createGroupNote(UUID userId, UUID groupId, String title, String content) {
        Note n = new Note();
        n.setUserId(userId);
        n.setGroupId(groupId); // Może być null
        n.setTitle(title);
        n.setContent(content);
        return repo.save(n);
    }

    @Transactional
    public Note update(UUID id, String title, String content) {
        Note existingNote = getNoteById(id);
        existingNote.setTitle(title);
        existingNote.setContent(content);
        return repo.save(existingNote);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie można usunąć: Notatka o podanym ID nie istnieje.");
        }
        repo.deleteById(id);
    }
}