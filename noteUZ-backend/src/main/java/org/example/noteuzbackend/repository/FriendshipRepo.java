package org.example.noteuzbackend.repository;

import org.example.noteuzbackend.model.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

/**
 * Repozytorium dla encji Friendship.
 */
public interface FriendshipRepo extends JpaRepository<Friendship, UUID> {

    /**
     * Znajduje zaproszenia do znajomych wysłane przez konkretnego użytkownika.
     * @param requesterId identyfikator użytkownika wysyłającego
     * @return lista relacji znajomości
     */
    List<Friendship> findByRequesterId(UUID requesterId);

    /**
     * Znajduje zaproszenia do znajomych skierowane do użytkownika o podanym adresie email.
     * @param addresseeEmail adres email adresata
     * @return lista relacji znajomości
     */
    List<Friendship> findByAddresseeEmail(String addresseeEmail);

    /**
     * Sprawdza czy relacja między dwoma użytkownikami już istnieje.
     * @param userId identyfikator pierwszego użytkownika
     * @param userEmail email pierwszego użytkownika
     * @param targetEmail email drugiego użytkownika
     * @return lista istniejących relacji
     */
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requesterId = :userId AND f.addresseeEmail = :targetEmail) OR " +
            "(f.addresseeEmail = :userEmail AND f.requesterEmail = :targetEmail)")
    List<Friendship> findExistingRelation(UUID userId, String userEmail, String targetEmail);
}