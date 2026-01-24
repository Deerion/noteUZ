package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "friendships")
public class Friendship {
    @Id
    private UUID id;

    private UUID requesterId;
    private String requesterEmail;
    private String addresseeEmail;
    private String status; // PENDING, ACCEPTED

    @CreationTimestamp
    private Instant createdAt;

    /**
     * Zapewnia wygenerowanie identyfikatora UUID oraz ustawienie domyślnego statusu przed zapisem.
     */
    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
        if (this.status == null) this.status = "PENDING";
    }

    /**
     * Pobiera identyfikator znajomości.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Ustawia identyfikator znajomości.
     * @param id identyfikator UUID
     */
    public void setId(UUID id) { this.id = id; }

    /**
     * Pobiera identyfikator użytkownika wysyłającego zaproszenie.
     * @return identyfikator UUID wysyłającego
     */
    public UUID getRequesterId() { return requesterId; }

    /**
     * Ustawia identyfikator użytkownika wysyłającego zaproszenie.
     * @param requesterId identyfikator UUID wysyłającego
     */
    public void setRequesterId(UUID requesterId) { this.requesterId = requesterId; }

    /**
     * Pobiera email użytkownika wysyłającego zaproszenie.
     * @return email wysyłającego
     */
    public String getRequesterEmail() { return requesterEmail; }

    /**
     * Ustawia email użytkownika wysyłającego zaproszenie.
     * @param requesterEmail email wysyłającego
     */
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }

    /**
     * Pobiera email adresata zaproszenia.
     * @return email adresata
     */
    public String getAddresseeEmail() { return addresseeEmail; }

    /**
     * Ustawia email adresata zaproszenia.
     * @param addresseeEmail email adresata
     */
    public void setAddresseeEmail(String addresseeEmail) { this.addresseeEmail = addresseeEmail; }

    /**
     * Pobiera status znajomości (np. PENDING, ACCEPTED).
     * @return status znajomości
     */
    public String getStatus() { return status; }

    /**
     * Ustawia status znajomości.
     * @param status status znajomości
     */
    public void setStatus(String status) { this.status = status; }

    /**
     * Pobiera znacznik czasu utworzenia znajomości.
     * @return czas utworzenia
     */
    public Instant getCreatedAt() { return createdAt; }
}