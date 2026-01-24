package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime start;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime end;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // ZMIANA: Zamiast jednego UUID, mamy zbiór (Set) UUID
    @ElementCollection
    @CollectionTable(name = "event_notes", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "note_id")
    private Set<UUID> noteIds = new HashSet<>();

    /**
     * Pobiera identyfikator wydarzenia.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Ustawia identyfikator wydarzenia.
     * @param id identyfikator UUID
     */
    public void setId(UUID id) { this.id = id; }

    /**
     * Pobiera tytuł wydarzenia.
     * @return tytuł wydarzenia
     */
    public String getTitle() { return title; }

    /**
     * Ustawia tytuł wydarzenia.
     * @param title tytuł wydarzenia
     */
    public void setTitle(String title) { this.title = title; }

    /**
     * Pobiera opis wydarzenia.
     * @return opis wydarzenia
     */
    public String getDescription() { return description; }

    /**
     * Ustawia opis wydarzenia.
     * @param description opis wydarzenia
     */
    public void setDescription(String description) { this.description = description; }

    /**
     * Pobiera czas rozpoczęcia wydarzenia.
     * @return data i czas rozpoczęcia
     */
    public LocalDateTime getStart() { return start; }

    /**
     * Ustawia czas rozpoczęcia wydarzenia.
     * @param start data i czas rozpoczęcia
     */
    public void setStart(LocalDateTime start) { this.start = start; }

    /**
     * Pobiera czas zakończenia wydarzenia.
     * @return data i czas zakończenia
     */
    public LocalDateTime getEnd() { return end; }

    /**
     * Ustawia czas zakończenia wydarzenia.
     * @param end data i czas zakończenia
     */
    public void setEnd(LocalDateTime end) { this.end = end; }

    /**
     * Pobiera identyfikator użytkownika będącego właścicielem wydarzenia.
     * @return identyfikator UUID użytkownika
     */
    public UUID getUserId() { return userId; }

    /**
     * Ustawia identyfikator użytkownika będącego właścicielem wydarzenia.
     * @param userId identyfikator UUID użytkownika
     */
    public void setUserId(UUID userId) { this.userId = userId; }

    /**
     * Pobiera zbiór identyfikatorów notatek powiązanych z wydarzeniem.
     * @return zbiór identyfikatorów UUID notatek
     */
    public Set<UUID> getNoteIds() { return noteIds; }

    /**
     * Ustawia zbiór identyfikatorów notatek powiązanych z wydarzeniem.
     * @param noteIds zbiór identyfikatorów UUID notatek
     */
    public void setNoteIds(Set<UUID> noteIds) { this.noteIds = noteIds; }
}