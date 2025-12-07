package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface NoteRepo extends JpaRepository<Note, UUID> {

    // Zapytanie, które pobiera notatki tylko dla konkretnego userId
    @Query("SELECT n FROM Note n WHERE n.user_id = :userId")
    List<Note> findByUserId(UUID userId);
}