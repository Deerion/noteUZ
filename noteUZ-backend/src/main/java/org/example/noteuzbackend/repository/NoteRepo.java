package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface NoteRepo extends JpaRepository<Note, UUID> {

    // Notatki prywatne (gdzie groupId jest NULL)
    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND n.groupId IS NULL")
    List<Note> findByUserId(UUID userId);

    // NOWE: Notatki grupowe
    List<Note> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}