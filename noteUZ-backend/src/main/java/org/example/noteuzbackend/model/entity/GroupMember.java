package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import org.example.noteuzbackend.model.enums.GroupRole;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "group_members", schema = "public")
public class GroupMember {
    @Id
    private UUID id;

    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    private GroupRole role;

    @CreationTimestamp
    @Column(name = "joined_at")
    private Instant joinedAt;

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
    public GroupMember() {}

    /**
     * Konstruktor tworzący nowe powiązanie użytkownika z grupą.
     * @param groupId identyfikator grupy
     * @param userId identyfikator użytkownika
     * @param role rola użytkownika w grupie
     */
    public GroupMember(UUID groupId, UUID userId, GroupRole role) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }

    /**
     * Pobiera identyfikator członkostwa.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Pobiera identyfikator grupy.
     * @return identyfikator UUID grupy
     */
    public UUID getGroupId() { return groupId; }

    /**
     * Ustawia identyfikator grupy.
     * @param groupId identyfikator UUID grupy
     */
    public void setGroupId(UUID groupId) { this.groupId = groupId; }

    /**
     * Pobiera identyfikator użytkownika.
     * @return identyfikator UUID użytkownika
     */
    public UUID getUserId() { return userId; }

    /**
     * Ustawia identyfikator użytkownika.
     * @param userId identyfikator UUID użytkownika
     */
    public void setUserId(UUID userId) { this.userId = userId; }

    /**
     * Pobiera rolę użytkownika w grupie.
     * @return rola w grupie
     */
    public GroupRole getRole() { return role; }

    /**
     * Ustawia rolę użytkownika w grupie.
     * @param role rola w grupie
     */
    public void setRole(GroupRole role) { this.role = role; }

    /**
     * Pobiera znacznik czasu dołączenia do grupy.
     * @return czas dołączenia
     */
    public Instant getJoinedAt() { return joinedAt; }
}