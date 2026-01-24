package org.example.noteuzbackend.dto;

import java.util.UUID;

/**
 * Klasa kontenerowa dla rekordów żądań związanych z notatkami.
 */
public class NoteRequests {
    /**
     * Obiekt DTO reprezentujący żądanie utworzenia notatki.
     *
     * @param title Tytuł notatki.
     * @param content Treść notatki.
     * @param groupId Identyfikator grupy (opcjonalny).
     */
    public record CreateNoteRequest(String title, String content, UUID groupId) {}

    /**
     * Obiekt DTO reprezentujący żądanie aktualizacji notatki.
     *
     * @param title Nowy tytuł notatki.
     * @param content Nowa treść notatki.
     */
    public record UpdateNoteRequest(String title, String content) {}

    /**
     * Obiekt DTO reprezentujący żądanie udostępnienia notatki.
     *
     * @param email Adres email użytkownika, któremu udostępniana jest notatka.
     * @param permission Poziom uprawnień (np. READ, WRITE).
     */
    public record ShareNoteRequest(String email, String permission) {}

    /**
     * Obiekt DTO reprezentujący żądanie aktualizacji uprawnień udostępnienia.
     *
     * @param permission Nowy poziom uprawnień.
     */
    public record UpdateShareRequest(String permission) {}
}