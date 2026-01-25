package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.AppUserRepo;
import org.example.noteuzbackend.repository.NoteRepo;
import org.example.noteuzbackend.repository.NoteShareRepo;
import org.example.noteuzbackend.repository.NoteVoteRepo;
import org.example.noteuzbackend.service.NoteService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteLifecycleTest {

    @Mock private NoteRepo noteRepo;
    @Mock private NoteShareRepo shareRepo;
    @Mock private NoteVoteRepo voteRepo;
    @Mock private AppUserRepo userRepo;

    @InjectMocks private NoteService noteService;

    @Test
    void shouldCreateNoteSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        String title = "Testowy Tytuł";
        String content = "Testowa treść";

        Note savedNote = new Note();
        savedNote.setUserId(userId);
        savedNote.setTitle(title);
        savedNote.setContent(content);

        when(noteRepo.save(any(Note.class))).thenReturn(savedNote);

        // When
        Note result = noteService.create(userId, title, content);

        // Then
        assertThat(result.getTitle())
                .as("Tytuł nowej notatki powinien być zgodny z podanym")
                .isEqualTo(title);

        verify(noteRepo).save(any(Note.class));
    }

    @Test
    void shouldGetNoteById() {
        // Given
        UUID noteId = UUID.randomUUID();
        Note note = new Note();
        note.setId(noteId);
        note.setTitle("Szukana notatka");

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(note));
        when(voteRepo.countByNote(note)).thenReturn(0L);

        Note result = noteService.getNoteById(noteId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(noteId);
        assertThat(result.getTitle()).isEqualTo("Szukana notatka");
    }

    @Test
    void shouldUpdateNote() {
        // Given
        UUID noteId = UUID.randomUUID();
        String newTitle = "Nowy Tytuł";
        String newContent = "Nowa treść";

        Note existingNote = new Note();
        existingNote.setId(noteId);
        existingNote.setTitle("Stary tytuł");

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(existingNote));

        when(noteRepo.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Note result = noteService.update(noteId, newTitle, newContent);

        assertThat(result.getTitle()).isEqualTo(newTitle);
        assertThat(result.getContent()).isEqualTo(newContent);
        verify(noteRepo).save(existingNote);
    }

    @Test
    void shouldDeleteNote() {
        UUID noteId = UUID.randomUUID();

        when(shareRepo.findAll()).thenReturn(Collections.emptyList());

        noteService.delete(noteId);

        verify(shareRepo).deleteAll(anyList());
        verify(voteRepo).deleteAllByNoteId(noteId);
        verify(noteRepo).deleteById(noteId);
    }
}