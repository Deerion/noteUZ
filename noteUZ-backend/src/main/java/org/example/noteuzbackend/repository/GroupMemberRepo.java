package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repozytorium dla encji GroupMember.
 */
public interface GroupMemberRepo extends JpaRepository<GroupMember, UUID> {
    /**
     * Pobiera listę członków konkretnej grupy.
     * @param groupId identyfikator grupy
     * @return lista członków grupy
     */
    List<GroupMember> findByGroupId(UUID groupId);

    /**
     * Znajduje powiązanie użytkownika z grupą na podstawie ich identyfikatorów.
     * @param groupId identyfikator grupy
     * @param userId identyfikator użytkownika
     * @return opcjonalny obiekt członka grupy
     */
    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);

    /**
     * Sprawdza, czy użytkownik jest już członkiem danej grupy.
     * @param groupId identyfikator grupy
     * @param userId identyfikator użytkownika
     * @return true, jeśli użytkownik jest członkiem grupy
     */
    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    /**
     * Pobiera listę powiązań z grupami dla konkretnego użytkownika.
     * @param userId identyfikator użytkownika
     * @return lista powiązań z grupami
     */
    List<GroupMember> findByUserId(UUID userId);
}