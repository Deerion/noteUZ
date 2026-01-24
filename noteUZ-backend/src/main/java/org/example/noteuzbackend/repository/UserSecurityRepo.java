package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.UserSecurity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Repozytorium dla encji UserSecurity.
 */
public interface UserSecurityRepo extends JpaRepository<UserSecurity, UUID> {

    /**
     * Usuwa użytkownika bezpośrednio ze schematu auth (dotyczy integracji z zewnętrznym systemem uwierzytelniania).
     * @param userId identyfikator użytkownika
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM auth.users WHERE id = :userId", nativeQuery = true)
    void deleteAuthUser(UUID userId);
}