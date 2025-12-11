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

    @PrePersist
    public void ensureId() {
        if (this.id == null) this.id = UUID.randomUUID();
    }

    // Konstruktory
    public GroupMember() {}
    public GroupMember(UUID groupId, UUID userId, GroupRole role) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public UUID getGroupId() { return groupId; }
    public void setGroupId(UUID groupId) { this.groupId = groupId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public GroupRole getRole() { return role; }
    public void setRole(GroupRole role) { this.role = role; }
    public Instant getJoinedAt() { return joinedAt; }
}