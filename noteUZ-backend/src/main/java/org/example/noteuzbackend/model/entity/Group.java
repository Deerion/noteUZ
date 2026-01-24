package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "groups", schema = "public") // Schema public jest ważna w Supabase
public class Group {
    @Id
    private UUID id;

    private String name;
    private String description;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    /**
     * Zapewnia wygenerowanie identyfikatora UUID przed zapisem.
     */
    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
    }

    /**
     * Pobiera identyfikator grupy.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Ustawia identyfikator grupy.
     * @param id identyfikator UUID
     */
    public void setId(UUID id) { this.id = id; }

    /**
     * Pobiera nazwę grupy.
     * @return nazwa grupy
     */
    public String getName() { return name; }

    /**
     * Ustawia nazwę grupy.
     * @param name nazwa grupy
     */
    public void setName(String name) { this.name = name; }

    /**
     * Pobiera opis grupy.
     * @return opis grupy
     */
    public String getDescription() { return description; }

    /**
     * Ustawia opis grupy.
     * @param description opis grupy
     */
    public void setDescription(String description) { this.description = description; }

    /**
     * Pobiera znacznik czasu utworzenia grupy.
     * @return czas utworzenia
     */
    public Instant getCreatedAt() { return createdAt; }
}