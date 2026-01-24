package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/**
 * Repozytorium dla encji NoteVote.
 */
public interface NoteVoteRepo extends JpaRepository<NoteVote, UUID> {
    /**
     * Znajduje głos oddany przez konkretnego użytkownika na określoną notatkę.
     * @param note obiekt notatki
     * @param user obiekt użytkownika
     * @return opcjonalny obiekt głosu
     */
    Optional<NoteVote> findByNoteAndUser(Note note, AppUser user);

    /**
     * Zlicza wszystkie głosy oddane na konkretną notatkę.
     * @param note obiekt notatki
     * @return liczba głosów
     */
    long countByNote(Note note);

    /**
     * Sprawdza, czy konkretny użytkownik oddał głos na daną notatkę.
     * @param note obiekt notatki
     * @param user obiekt użytkownika
     * @return true, jeśli użytkownik zagłosował
     */
    boolean existsByNoteAndUser(Note note, AppUser user);

    /**
     * Usuwa głos oddany przez użytkownika na konkretną notatkę.
     * @param note obiekt notatki
     * @param user obiekt użytkownika
     */
    void deleteByNoteAndUser(Note note, AppUser user);

    /**
     * Usuwa wszystkie głosy powiązane z notatką o podanym identyfikatorze.
     * @param noteId identyfikator notatki
     */
    void deleteAllByNoteId(UUID noteId);
}