package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepo extends JpaRepository<Note, UUID> {

    // Notatki prywatne (gdzie groupId jest NULL)
    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND n.groupId IS NULL")
    List<Note> findByUserId(UUID userId);

    // Notatki prywatne - alternatywna metoda bez @Query
    List<Note> findByUserIdAndGroupIdIsNull(UUID userId);

    // Notatki grupowe
    List<Note> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}
