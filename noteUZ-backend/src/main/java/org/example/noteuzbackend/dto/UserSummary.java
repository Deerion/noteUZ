package org.example.noteuzbackend.dto;

import java.util.UUID;

public record UserSummary(UUID id, String email) {}