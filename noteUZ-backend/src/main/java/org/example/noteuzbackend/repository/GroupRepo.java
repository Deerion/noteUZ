package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

/**
 * Repozytorium dla encji Group.
 */
public interface GroupRepo extends JpaRepository<Group, UUID> {
}