package org.example.noteuzbackend.model.enums;

public enum Role {
    USER,       // Zwykły szary użytkownik
    MODERATOR,  // Pomocnik (może banować userów, widzieć dane)
    ADMIN       // Właściciel (święty, ustawiany tylko w bazie)
}