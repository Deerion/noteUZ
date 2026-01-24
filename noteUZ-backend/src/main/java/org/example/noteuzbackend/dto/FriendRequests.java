package org.example.noteuzbackend.dto;

/**
 * Klasa kontenerowa dla rekordów żądań związanych ze znajomościami.
 */
public class FriendRequests {
    /**
     * Obiekt DTO reprezentujący żądanie zaproszenia do znajomych.
     *
     * @param email Adres email zapraszanego użytkownika.
     */
    public record InviteFriendRequest(String email) {}
}