package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "group_invitations")
public class GroupInvitation {
    @Id
    private UUID id;

    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "inviter_id")
    private UUID inviterId; // Kto zaprosił (np. Admin)

    @Column(name = "invitee_id")
    private UUID inviteeId; // Kogo zaproszono

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
    }

    // Konstruktory
    public GroupInvitation() {}

    public GroupInvitation(UUID groupId, UUID inviterId, UUID inviteeId) {
        this.groupId = groupId;
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
    }

    // Getters
    public UUID getId() { return id; }
    public UUID getGroupId() { return groupId; }
    public UUID getInviterId() { return inviterId; }
    public UUID getInviteeId() { return inviteeId; }
    public Instant getCreatedAt() { return createdAt; }
}