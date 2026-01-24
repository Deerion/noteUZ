package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.GroupInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repozytorium dla encji GroupInvitation.
 */
public interface GroupInvitationRepo extends JpaRepository<GroupInvitation, UUID> {
    /**
     * Znajduje zaproszenia do grupy dla konkretnego użytkownika.
     * @param inviteeId identyfikator zapraszanego użytkownika
     * @return lista zaproszeń
     */
    List<GroupInvitation> findByInviteeId(UUID inviteeId);

    /**
     * Sprawdza, czy zaproszenie do danej grupy dla konkretnego użytkownika już istnieje.
     * @param groupId identyfikator grupy
     * @param inviteeId identyfikator zapraszanego użytkownika
     * @return true, jeśli zaproszenie istnieje
     */
    boolean existsByGroupIdAndInviteeId(UUID groupId, UUID inviteeId);

    /**
     * Znajduje konkretne zaproszenie na podstawie jego identyfikatora i identyfikatora adresata.
     * @param id identyfikator zaproszenia
     * @param inviteeId identyfikator zapraszanego użytkownika
     * @return opcjonalny obiekt zaproszenia
     */
    Optional<GroupInvitation> findByIdAndInviteeId(UUID id, UUID inviteeId);
}