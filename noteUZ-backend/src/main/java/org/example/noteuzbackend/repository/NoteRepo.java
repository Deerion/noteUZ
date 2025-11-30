package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface NoteRepo extends JpaRepository<Note, UUID> {
    // Pobierz notatki tylko danego usera, od najnowszych
    List<Note> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}