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

    /**
     * Zapewnia wygenerowanie identyfikatora UUID przed zapisem.
     */
    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
    }

    /**
     * Konstruktor domyślny.
     */
    public GroupInvitation() {}

    /**
     * Konstruktor tworzący nowe zaproszenie.
     * @param groupId identyfikator grupy
     * @param inviterId identyfikator osoby zapraszającej
     * @param inviteeId identyfikator osoby zapraszanej
     */
    public GroupInvitation(UUID groupId, UUID inviterId, UUID inviteeId) {
        this.groupId = groupId;
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
    }

    /**
     * Pobiera identyfikator zaproszenia.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Pobiera identyfikator grupy, do której wysłano zaproszenie.
     * @return identyfikator UUID grupy
     */
    public UUID getGroupId() { return groupId; }

    /**
     * Pobiera identyfikator osoby, która wysłała zaproszenie.
     * @return identyfikator UUID osoby zapraszającej
     */
    public UUID getInviterId() { return inviterId; }

    /**
     * Pobiera identyfikator osoby, która otrzymała zaproszenie.
     * @return identyfikator UUID osoby zapraszanej
     */
    public UUID getInviteeId() { return inviteeId; }

    /**
     * Pobiera znacznik czasu utworzenia zaproszenia.
     * @return czas utworzenia
     */
    public Instant getCreatedAt() { return createdAt; }
}