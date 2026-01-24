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
    void shouldCreateNoteSuccessfully() {
        UUID userId = UUID.randomUUID();
        String title = "Testowy Tytuł";
        String content = "Testowa treść";

        Note savedNote = new Note();
        savedNote.setUserId(userId);
        savedNote.setTitle(title);
        savedNote.setContent(content);

        when(noteRepo.save(any(Note.class))).thenReturn(savedNote);

        Note result = noteService.create(userId, title, content);

        assertThat(result.getTitle())
                .as("Tytuł nowej notatki powinien być zgodny z podanym")
                .isEqualTo(title);
    }
}