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

    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
        if (this.status == null) this.status = "PENDING";
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getRequesterId() { return requesterId; }
    public void setRequesterId(UUID requesterId) { this.requesterId = requesterId; }
    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }
    public String getAddresseeEmail() { return addresseeEmail; }
    public void setAddresseeEmail(String addresseeEmail) { this.addresseeEmail = addresseeEmail; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}