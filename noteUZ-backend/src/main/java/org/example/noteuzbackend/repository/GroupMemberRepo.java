package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMemberRepo extends JpaRepository<GroupMember, UUID> {
    // Pobierz członków konkretnej grupy
    List<GroupMember> findByGroupId(UUID groupId);

    // Sprawdź, czy dany user jest w grupie (do weryfikacji uprawnień)
    Optional<GroupMember> findByGroupIdAndUserId(UUID groupId, UUID userId);

    // Sprawdź czy już istnieje (żeby nie dodawać 2 razy)
    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    // Pobierz grupy, do których należy user
    // Uwaga: To zwróci listę obiektów GroupMember.
    // W serwisie zamienimy to na listę Grup lub DTO.
    List<GroupMember> findByUserId(UUID userId);
}