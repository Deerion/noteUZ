package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface NoteVoteRepo extends JpaRepository<NoteVote, UUID> {
    Optional<NoteVote> findByNoteAndUser(Note note, AppUser user);
    long countByNote(Note note);
    boolean existsByNoteAndUser(Note note, AppUser user);
    void deleteByNoteAndUser(Note note, AppUser user);
    void deleteAllByNoteId(UUID noteId);
}