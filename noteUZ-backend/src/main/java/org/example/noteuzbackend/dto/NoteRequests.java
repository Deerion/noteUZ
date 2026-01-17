package org.example.noteuzbackend.dto;

import java.util.UUID;

public class NoteRequests {
    // groupId jest opcjonalne (może być null)
    public record CreateNoteRequest(String title, String content, UUID groupId) {}
    public record UpdateNoteRequest(String title, String content) {}
    public record ShareNoteRequest(String email, String permission) {}
    public record UpdateShareRequest(String permission) {}
}