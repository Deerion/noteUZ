package org.example.noteuzbackend.dto;

import org.example.noteuzbackend.model.enums.Role;
import java.util.UUID;

public record AdminUserDTO(
        UUID id,
        String email,
        Role role,
        boolean isBanned,
        int warnings,
        String displayName
) {}