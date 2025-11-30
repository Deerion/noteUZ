package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.NoteRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NoteService {
    private final NoteRepo repo;

    public NoteService(NoteRepo repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public List<Note> getUserNotes(UUID userId) {
        return repo.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Note create(UUID userId, String title, String content) {
        Note n = new Note();
        n.setUserId(userId);
        n.setTitle((title == null || title.isBlank()) ? "Dokument bez tytułu" : title);
        n.setContent(content);
        return repo.save(n);
    }

    @Transactional
    public void delete(UUID noteId, UUID userId) {
        repo.findById(noteId).ifPresent(note -> {
            if (note.getUserId().equals(userId)) {
                repo.delete(note);
            }
        });
    }
}