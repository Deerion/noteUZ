package org.example.noteuzbackend.dto;

/**
 * Klasa kontenerowa dla rekordów żądań związanych z grupami.
 */
public class GroupRequests {
    /**
     * Obiekt DTO reprezentujący żądanie utworzenia grupy.
     *
     * @param name Nazwa grupy.
     * @param description Opis grupy.
     */
    public record CreateGroupRequest(String name, String description) {}

    /**
     * Obiekt DTO reprezentujący żądanie zaproszenia członka do grupy.
     *
     * @param email Adres email zapraszanego użytkownika.
     */
    public record InviteMemberRequest(String email) {}

    /**
     * Obiekt DTO reprezentujący odpowiedź na zaproszenie do grupy.
     *
     * @param accept Flaga określająca, czy zaproszenie zostało zaakceptowane.
     */
    public record InvitationResponseRequest(Boolean accept) {}

    /**
     * Obiekt DTO reprezentujący żądanie zmiany roli członka grupy.
     *
     * @param role Nowa rola użytkownika w grupie.
     */
    public record ChangeRoleRequest(String role) {}

    /**
     * Obiekt DTO reprezentujący żądanie utworzenia notatki w grupie.
     *
     * @param title Tytuł notatki.
     * @param content Treść notatki.
     */
    public record CreateGroupNoteRequest(String title, String content) {}
}