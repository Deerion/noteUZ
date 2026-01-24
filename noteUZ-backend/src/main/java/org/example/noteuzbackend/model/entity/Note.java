package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Reprezentuje notatkę utworzoną przez użytkownika.
 * Notatka może być prywatna lub przypisana do grupy, posiada tytuł, treść oraz metadane o czasie utworzenia i edycji.
 */
@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "group_id")
    private UUID groupId;

    // --- NOWE POLA DO GŁOSOWANIA (Transient - nie zapisywane w bazie) ---
    @Transient
    private long voteCount = 0;

    @Transient
    private boolean votedByMe = false;

    /**
     * Ustawia czas utworzenia i aktualizacji przed zapisem nowej notatki.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Aktualizuje czas modyfikacji przed aktualizacją istniejącej notatki.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Pobiera identyfikator notatki.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Ustawia identyfikator notatki.
     * @param id identyfikator UUID
     */
    public void setId(UUID id) { this.id = id; }

    /**
     * Pobiera tytuł notatki.
     * @return tytuł notatki
     */
    public String getTitle() { return title; }

    /**
     * Ustawia tytuł notatki.
     * @param title tytuł notatki
     */
    public void setTitle(String title) { this.title = title; }

    /**
     * Pobiera treść notatki.
     * @return treść notatki
     */
    public String getContent() { return content; }

    /**
     * Ustawia treść notatki.
     * @param content treść notatki
     */
    public void setContent(String content) { this.content = content; }

    /**
     * Pobiera identyfikator użytkownika będącego właścicielem notatki.
     * @return identyfikator UUID użytkownika
     */
    public UUID getUserId() { return userId; }

    /**
     * Ustawia identyfikator użytkownika będącego właścicielem notatki.
     * @param userId identyfikator UUID użytkownika
     */
    public void setUserId(UUID userId) { this.userId = userId; }

    /**
     * Pobiera znacznik czasu utworzenia notatki.
     * @return czas utworzenia
     */
    public LocalDateTime getCreatedAt() { return createdAt; }

    /**
     * Ustawia znacznik czasu utworzenia notatki.
     * @param createdAt czas utworzenia
     */
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Pobiera znacznik czasu ostatniej aktualizacji notatki.
     * @return czas aktualizacji
     */
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    /**
     * Ustawia znacznik czasu ostatniej aktualizacji notatki.
     * @param updatedAt czas aktualizacji
     */
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /**
     * Pobiera identyfikator grupy, do której przypisana jest notatka.
     * @return identyfikator UUID grupy
     */
    public UUID getGroupId() { return groupId; }

    /**
     * Ustawia identyfikator grupy, do której przypisana jest notatka.
     * @param groupId identyfikator UUID grupy
     */
    public void setGroupId(UUID groupId) { this.groupId = groupId; }

    /**
     * Pobiera liczbę głosów oddanych na notatkę.
     * @return liczba głosów
     */
    public long getVoteCount() { return voteCount; }

    /**
     * Ustawia liczbę głosów oddanych na notatkę.
     * @param voteCount liczba głosów
     */
    public void setVoteCount(long voteCount) { this.voteCount = voteCount; }

    /**
     * Sprawdza, czy aktualny użytkownik zagłosował na tę notatkę.
     * @return true, jeśli użytkownik zagłosował
     */
    public boolean isVotedByMe() { return votedByMe; }

    /**
     * Ustawia informację, czy aktualny użytkownik zagłosował na tę notatkę.
     * @param votedByMe true, jeśli użytkownik zagłosował
     */
    public void setVotedByMe(boolean votedByMe) { this.votedByMe = votedByMe; }
}