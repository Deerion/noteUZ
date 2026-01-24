package org.example.noteuzbackend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Obiekt DTO reprezentujący informację o notatce dla panelu administracyjnego.
 *
 * @param id Unikalny identyfikator notatki.
 * @param title Tytuł notatki.
 * @param content Treść notatki.
 * @param createdAt Data i czas utworzenia notatki.
 * @param authorName Nazwa wyświetlana autora notatki.
 * @param groupName Nazwa grupy (jeśli notatka jest przypisana do grupy).
 * @param isGroupNote Flaga określająca, czy notatka jest notatką grupową.
 */
public record AdminNoteDTO(
        UUID id,
        String title,
        String content,
        LocalDateTime createdAt,
        String authorName,
        String groupName,
        boolean isGroupNote
) {}