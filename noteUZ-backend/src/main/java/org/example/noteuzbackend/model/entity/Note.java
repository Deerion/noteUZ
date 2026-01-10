package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters & Setters ---

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getGroupId() { return groupId; }
    public void setGroupId(UUID groupId) { this.groupId = groupId; }

    public long getVoteCount() { return voteCount; }
    public void setVoteCount(long voteCount) { this.voteCount = voteCount; }

    public boolean isVotedByMe() { return votedByMe; }
    public void setVotedByMe(boolean votedByMe) { this.votedByMe = votedByMe; }
}