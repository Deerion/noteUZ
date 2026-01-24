package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.noteuzbackend.model.enums.Role;

import java.util.UUID;

/**
 * Reprezentuje dane bezpieczeństwa i uprawnień użytkownika.
 * Przechowuje informacje o roli (USER, MODERATOR, ADMIN), statusie blokady oraz liczbie ostrzeżeń.
 */
@Entity
@Table(name = "user_security")
@Getter
@Setter
@NoArgsConstructor
public class UserSecurity {

    @Id
    @Column(name = "user_id")
    private UUID id;

    // Email pobieramy z AppUser, tutaj go nie mapujemy, by uniknąć błędów

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.USER;

    @Column(name = "is_banned")
    private boolean isBanned = false;

    @Column(name = "warning_count")
    private int warnings = 0;

    /**
     * Konstruktor tworzący obiekt zabezpieczeń dla użytkownika.
     * @param id identyfikator użytkownika
     */
    public UserSecurity(UUID id) {
        this.id = id;
        this.role = Role.USER;
        this.isBanned = false;
        this.warnings = 0;
    }
}