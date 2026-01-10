package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.UserSecurity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserSecurityRepo extends JpaRepository<UserSecurity, UUID> {
}