package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/**
 * Repozytorium dla encji AppUser.
 */
public interface AppUserRepo extends JpaRepository<AppUser, UUID> {
    /**
     * Znajduje użytkownika na podstawie adresu email.
     * @param email adres email użytkownika
     * @return opcjonalny obiekt użytkownika
     */
    Optional<AppUser> findByEmail(String email);
}