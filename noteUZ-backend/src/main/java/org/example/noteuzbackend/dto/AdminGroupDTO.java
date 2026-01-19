package org.example.noteuzbackend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
    public record GroupMemberDTO(String name, String email, String role) {}
}