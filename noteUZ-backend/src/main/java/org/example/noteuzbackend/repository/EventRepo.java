package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

/**
 * Repozytorium dla encji Event.
 */
public interface EventRepo extends JpaRepository<Event, UUID> {
    /**
     * Pobiera wydarzenia użytkownika posortowane chronologicznie według czasu rozpoczęcia.
     * @param userId identyfikator użytkownika
     * @return lista wydarzeń
     */
    List<Event> findByUserIdOrderByStartAsc(UUID userId);
}