package org.example.noteuzbackend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminNoteDTO(
        UUID id,
        String title,
        String content,
        LocalDateTime createdAt,
        String authorName,
        String groupName,
        boolean isGroupNote
) {}