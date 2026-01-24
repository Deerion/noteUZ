package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repozytorium dla encji Note.
 */
@Repository
public interface NoteRepo extends JpaRepository<Note, UUID> {

    /**
     * Pobiera notatki prywatne użytkownika (nieprzypisane do żadnej grupy).
     * @param userId identyfikator użytkownika
     * @return lista notatek prywatnych
     */
    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND n.groupId IS NULL")
    List<Note> findByUserId(UUID userId);

    /**
     * Pobiera notatki prywatne użytkownika na podstawie identyfikatora (alternatywna metoda).
     * @param userId identyfikator użytkownika
     * @return lista notatek prywatnych
     */
    List<Note> findByUserIdAndGroupIdIsNull(UUID userId);

    /**
     * Pobiera notatki przypisane do konkretnej grupy, posortowane malejąco według daty utworzenia.
     * @param groupId identyfikator grupy
     * @return lista notatek grupowych
     */
    List<Note> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}
