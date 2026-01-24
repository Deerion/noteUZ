package org.example.noteuzbackend.model.enums;

/**
 * Reprezentuje role systemowe użytkowników.
 */
public enum Role {
    /** Zwykły użytkownik */
    USER,
    /** Moderator z uprawnieniami do banowania i wglądu w dane */
    MODERATOR,
    /** Administrator systemu z pełnymi uprawnieniami */
    ADMIN
}