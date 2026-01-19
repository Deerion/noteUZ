package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.NoteShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteShareRepo extends JpaRepository<NoteShare, UUID> {

    // ZMIANA: Token szukamy po Stringu
    Optional<NoteShare> findByToken(String token);

    List<NoteShare> findByRecipientEmailAndStatus(String email, NoteShare.ShareStatus status);

    Optional<NoteShare> findByNoteIdAndRecipientEmail(UUID noteId, String email);

    List<NoteShare> findByNoteId(UUID noteId);
}
