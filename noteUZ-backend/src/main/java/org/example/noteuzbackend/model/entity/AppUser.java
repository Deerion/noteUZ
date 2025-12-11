package org.example.noteuzbackend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.util.UUID;

@Entity
@Immutable // To ważne - nie chcemy zapisywać danych do widoku, tylko czytać
@Table(name = "users_view", schema = "public")
public class AppUser {

    @Id
    private UUID id;

    private String email;

    @Column(name = "display_name")
    private String displayName;

    // Getters
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
}