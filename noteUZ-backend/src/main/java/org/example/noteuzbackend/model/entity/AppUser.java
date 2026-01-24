package org.example.noteuzbackend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.util.UUID;

@Entity
@Immutable
@Table(name = "users_view", schema = "public")
public class AppUser {

    @Id
    private UUID id;

    private String email;

    @Column(name = "display_name")
    private String displayName;

    /**
     * Pobiera identyfikator użytkownika.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Pobiera adres email użytkownika.
     * @return adres email
     */
    public String getEmail() { return email; }

    /**
     * Pobiera nazwę wyświetlaną użytkownika.
     * @return nazwa wyświetlana
     */
    public String getDisplayName() { return displayName; }
}