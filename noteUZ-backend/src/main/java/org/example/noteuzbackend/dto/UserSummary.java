package org.example.noteuzbackend.dto;

import java.util.UUID;

/**
 * Obiekt DTO reprezentujący podstawowe dane użytkownika.
 *
 * @param id Unikalny identyfikator użytkownika.
 * @param email Adres email użytkownika.
 */
public record UserSummary(UUID id, String email) {}