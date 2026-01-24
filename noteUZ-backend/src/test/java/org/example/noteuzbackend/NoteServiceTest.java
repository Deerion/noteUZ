package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.AppUser;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.model.entity.NoteVote;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.repository.NoteRepo;
import org.example.noteuzbackend.repository.NoteShareRepo;
import org.example.noteuzbackend.repository.NoteVoteRepo;
import org.example.noteuzbackend.service.NoteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock private NoteRepo noteRepo;
    @Mock private NoteShareRepo shareRepo;
    @Mock private AppUserRepo userRepo;
    @Mock private NoteVoteRepo voteRepo;

    @InjectMocks
    private NoteService noteService;

    @Test
    void shouldAddVoteIfNoneExists() {
        UUID noteId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Note note = new Note();
        AppUser user = new AppUser();

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(note));
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        when(voteRepo.findByNoteAndUser(note, user)).thenReturn(Optional.empty());
        when(voteRepo.countByNote(note)).thenReturn(1L);

        Map<String, Object> result = noteService.toggleVote(noteId, userId);

        verify(voteRepo).save(any(NoteVote.class));
        assertThat(result.get("votedByMe")).isEqualTo(true);
    }

    @Test
    void shouldRemoveVoteIfExists() {
        UUID noteId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Note note = new Note();
        AppUser user = new AppUser();
        NoteVote existingVote = new NoteVote(note, user);

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(note));
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        when(voteRepo.findByNoteAndUser(note, user)).thenReturn(Optional.of(existingVote));

        noteService.toggleVote(noteId, userId);

        verify(voteRepo).delete(existingVote);
    }
}
