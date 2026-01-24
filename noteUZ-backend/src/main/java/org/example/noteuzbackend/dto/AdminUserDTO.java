package org.example.noteuzbackend.dto;

import org.example.noteuzbackend.model.enums.Role;
import java.util.UUID;

/**
 * Obiekt DTO reprezentujący informację o użytkowniku dla panelu administracyjnego.
 *
 * @param id Unikalny identyfikator użytkownika.
 * @param email Adres email użytkownika.
 * @param role Rola użytkownika w systemie (np. USER, MODERATOR, ADMIN).
 * @param isBanned Flaga określająca, czy użytkownik jest zablokowany.
 * @param warnings Liczba ostrzeżeń otrzymanych przez użytkownika.
 * @param displayName Nazwa wyświetlana użytkownika.
 */
public record AdminUserDTO(
        UUID id,
        String email,
        Role role,
        boolean isBanned,
        int warnings,
        String displayName
) {}