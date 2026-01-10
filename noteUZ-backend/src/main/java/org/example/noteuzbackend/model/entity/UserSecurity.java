package org.example.noteuzbackend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "user_security")
public class UserSecurity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "is_admin")
    private boolean isAdmin = false;

    @Column(name = "is_banned")
    private boolean isBanned = false;

    @Column(name = "warning_count")
    private int warningCount = 0;

    public UserSecurity() {}

    public UserSecurity(UUID userId) {
        this.userId = userId;
    }

    // Getters & Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isAdmin() { return isAdmin; }
    public void setAdmin(boolean admin) { isAdmin = admin; }

    public boolean isBanned() { return isBanned; }
    public void setBanned(boolean banned) { isBanned = banned; }

    public int getWarningCount() { return warningCount; }
    public void setWarningCount(int warningCount) { this.warningCount = warningCount; }
}