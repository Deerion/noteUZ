package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepo extends JpaRepository<AppUser, UUID> {
    // Ta metoda magicznie zamieni E-mail na całego usera (wraz z ID)
    Optional<AppUser> findByEmail(String email);
}