package org.example.noteuzbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.noteuzbackend.controller.NoteController;
import org.example.noteuzbackend.model.entity.Note;
import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.EmailService;
import org.example.noteuzbackend.service.NoteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NoteController.class)
@AutoConfigureMockMvc(addFilters = false)
class NoteUZControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private NoteService noteService;
    @MockBean private AuthService authService;
    @MockBean private EmailService emailService;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void shouldReturnNotesWhenUserIsAuthorized() throws Exception {
        String fakeToken = "valid-token";
        UUID userId = UUID.randomUUID();

        ResponseEntity response = ResponseEntity.ok(Map.of("id", userId.toString()));
        given(authService.getUser(fakeToken)).willReturn(response);

        Note note = new Note();
        note.setTitle("Moja notatka");
        given(noteService.listNotes(userId)).willReturn(List.of(note));

        mockMvc.perform(get("/api/notes")
                        .cookie(new jakarta.servlet.http.Cookie("jwt", fakeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Moja notatka"));
    }

    @Test
    void shouldCreateNote() throws Exception {
        String fakeToken = "valid-token";
        UUID userId = UUID.randomUUID();
        Map<String, Object> requestBody = Map.of("title", "Nowa", "content", "Treść");

        ResponseEntity response = ResponseEntity.ok(Map.of("id", userId.toString()));
        given(authService.getUser(fakeToken)).willReturn(response);

        Note createdNote = new Note();
        createdNote.setTitle("Nowa");
        given(noteService.create(eq(userId), eq("Nowa"), eq("Treść"))).willReturn(createdNote);

        mockMvc.perform(post("/api/notes")
                        .cookie(new jakarta.servlet.http.Cookie("jwt", fakeToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Nowa"));
    }
}