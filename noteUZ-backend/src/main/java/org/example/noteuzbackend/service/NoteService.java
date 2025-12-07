package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.NoteRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepo repo;

    public NoteService(NoteRepo repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Note> listNotes(UUID userId) {
        return repo.findByUserId(userId);
    }

    // NOWA METODA: Pobieranie notatki po ID
    @Transactional(readOnly = true)
    public Note getNoteById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notatka o podanym ID nie istnieje."));
    }

    @Transactional
    public Note create(UUID userId, String title, String content) {
        Note n = new Note();
        n.setUser_id(userId);
        n.setTitle(title);
        n.setContent(content);
        return repo.save(n);
    }

    // NOWA METODA: Aktualizacja notatki
    @Transactional
    public Note update(UUID id, String title, String content) {
        Note existingNote = getNoteById(id); // Używamy metody do znalezienia notatki

        // Aktualizacja pól
        existingNote.setTitle(title);
        existingNote.setContent(content);

        // Zapis do bazy danych
        return repo.save(existingNote);
    }

    // NOWA METODA: Usuwanie notatki
    @Transactional
    public void delete(UUID id) {
        // Sprawdzenie, czy notatka istnieje przed usunięciem
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie można usunąć: Notatka o podanym ID nie istnieje.");
        }
        repo.deleteById(id);
    }
}