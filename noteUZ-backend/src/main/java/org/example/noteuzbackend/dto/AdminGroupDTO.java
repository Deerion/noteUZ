package org.example.noteuzbackend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Obiekt DTO reprezentujący szczegółowe informacje o grupie dla panelu administracyjnego.
 *
 * @param id Unikalny identyfikator grupy.
 * @param name Nazwa grupy.
 * @param description Opis grupy.
 * @param ownerName Nazwa wyświetlana właściciela grupy.
 * @param ownerEmail Adres email właściciela grupy.
 * @param memberCount Liczba członków należących do grupy.
 * @param noteCount Liczba notatek przypisanych do grupy.
 * @param createdAt Data i czas utworzenia grupy.
 * @param members Lista uproszczonych obiektów członków grupy.
 */
public record AdminGroupDTO(
        UUID id,
        String name,
        String description,
        String ownerName,       // Nazwa właściciela
        String ownerEmail,      // Email właściciela (do identyfikacji)
        int memberCount,        // Liczba członków
        int noteCount,          // Liczba notatek
        LocalDateTime createdAt,
        List<GroupMemberDTO> members // Lista członków do podglądu
) {
    /**
     * Uproszczony obiekt DTO reprezentujący członka grupy.
     *
     * @param name Nazwa wyświetlana członka.
     * @param email Adres email członka.
     * @param role Rola członka w grupie.
     */
    public record GroupMemberDTO(String name, String email, String role) {}
}