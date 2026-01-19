package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.GroupInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupInvitationRepo extends JpaRepository<GroupInvitation, UUID> {
    // Znajdź zaproszenia DLA konkretnego użytkownika
    List<GroupInvitation> findByInviteeId(UUID inviteeId);

    // Sprawdź czy zaproszenie już istnieje
    boolean existsByGroupIdAndInviteeId(UUID groupId, UUID inviteeId);

    // Znajdź konkretne zaproszenie skierowane do danego użytkownika (dla bezpieczeństwa)
    Optional<GroupInvitation> findByIdAndInviteeId(UUID id, UUID inviteeId);
}