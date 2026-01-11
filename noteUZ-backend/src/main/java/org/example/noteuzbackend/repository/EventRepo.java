package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EventRepo extends JpaRepository<Event, UUID> {
    // Ta metoda jest kluczowa - pobiera wydarzenia i sortuje je chronologicznie
    List<Event> findByUserIdOrderByStartAsc(UUID userId);
}