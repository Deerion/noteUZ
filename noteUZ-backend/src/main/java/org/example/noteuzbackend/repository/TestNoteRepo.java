package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.TestNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TestNoteRepo extends JpaRepository<TestNote, UUID> {
}
