package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.UserAvatar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/**
 * Repozytorium dla encji UserAvatar.
 */
public interface UserAvatarRepo extends JpaRepository<UserAvatar, UUID> {
}