package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface FriendshipRepo extends JpaRepository<Friendship, UUID> {

    // Znajdź zaproszenia wysłane PRZEZE MNIE
    List<Friendship> findByRequesterId(UUID requesterId);

    // Znajdź zaproszenia skierowane DO MNIE (po emailu)
    List<Friendship> findByAddresseeEmail(String addresseeEmail);

    // Sprawdź czy relacja już istnieje (żeby nie zapraszać 2 razy)
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requesterId = :userId AND f.addresseeEmail = :targetEmail) OR " +
            "(f.addresseeEmail = :userEmail AND f.requesterEmail = :targetEmail)")
    List<Friendship> findExistingRelation(UUID userId, String userEmail, String targetEmail);
}