package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.repository.NoteRepo;
import org.example.noteuzbackend.service.NoteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepo noteRepo;

    @InjectMocks
    private NoteService noteService;

    @Test
    void shouldCreateNoteSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        String title = "Testowy Tytuł";
        String content = "Testowa treść";

        Note savedNote = new Note();
        savedNote.setId(UUID.randomUUID());
        savedNote.setUserId(userId);
        savedNote.setTitle(title);
        savedNote.setContent(content);

        when(noteRepo.save(any(Note.class))).thenReturn(savedNote);

        // When
        Note result = noteService.create(userId, title, content);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(title);
        assertThat(result.getUserId()).isEqualTo(userId); // Oryginalna nazwa

        verify(noteRepo, times(1)).save(any(Note.class));
    }

    @Test
    void shouldReturnAllNotesForUser() {
        // Given
        UUID userId = UUID.randomUUID();
        Note note1 = new Note();
        note1.setTitle("Notatka 1");

        when(noteRepo.findByUserId(userId)).thenReturn(List.of(note1));

        List<Note> notes = noteService.listNotes(userId);

        assertThat(notes).hasSize(1);
        assertThat(notes.get(0).getTitle()).isEqualTo("Notatka 1");
    }

    @Test
    void shouldUpdateNote() {
        UUID noteId = UUID.randomUUID();
        Note existingNote = new Note();
        existingNote.setId(noteId);
        existingNote.setTitle("Stary tytuł");

        when(noteRepo.findById(noteId)).thenReturn(Optional.of(existingNote));
        when(noteRepo.save(any(Note.class))).thenAnswer(i -> i.getArgument(0));

        Note updatedNote = noteService.update(noteId, "Nowy tytuł", "Nowa treść");

        assertThat(updatedNote.getTitle()).isEqualTo("Nowy tytuł");
    }

    @Test
    void shouldDeleteNote() {
        UUID noteId = UUID.randomUUID();

        when(noteRepo.existsById(noteId)).thenReturn(true);

        noteService.delete(noteId);

        verify(noteRepo, times(1)).deleteById(noteId);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentNote() {
        UUID noteId = UUID.randomUUID();
        when(noteRepo.existsById(noteId)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            noteService.delete(noteId);
        });
    }
}