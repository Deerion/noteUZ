package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.NoteShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repozytorium dla encji NoteShare.
 */
@Repository
public interface NoteShareRepo extends JpaRepository<NoteShare, UUID> {

    /**
     * Znajduje udostępnienie na podstawie tokenu.
     * @param token unikalny token udostępnienia
     * @return opcjonalny obiekt udostępnienia
     */
    Optional<NoteShare> findByToken(String token);

    /**
     * Pobiera listę udostępnień dla danego adresu email o określonym statusie.
     * @param email adres email odbiorcy
     * @param status status udostępnienia
     * @return lista udostępnień
     */
    List<NoteShare> findByRecipientEmailAndStatus(String email, NoteShare.ShareStatus status);

    /**
     * Znajduje udostępnienie konkretnej notatki dla danego adresu email.
     * @param noteId identyfikator notatki
     * @param email adres email odbiorcy
     * @return opcjonalny obiekt udostępnienia
     */
    Optional<NoteShare> findByNoteIdAndRecipientEmail(UUID noteId, String email);

    /**
     * Pobiera wszystkie udostępnienia powiązane z konkretną notatką.
     * @param noteId identyfikator notatki
     * @return lista udostępnień
     */
    List<NoteShare> findByNoteId(UUID noteId);
}
