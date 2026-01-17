package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.UserSecurity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface UserSecurityRepo extends JpaRepository<UserSecurity, UUID> {

    // ZMIANA: Dodano metodę do usuwania użytkownika z głównej tabeli auth.users
    // Dzięki ON DELETE CASCADE w bazie, to usunie też wszystko inne (notatki, grupy itp.)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM auth.users WHERE id = :userId", nativeQuery = true)
    void deleteAuthUser(UUID userId);
}