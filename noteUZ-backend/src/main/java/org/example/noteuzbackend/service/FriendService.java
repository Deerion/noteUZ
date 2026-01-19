package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.Friendship;
import org.example.noteuzbackend.repository.FriendshipRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
public class FriendService {
    private final FriendshipRepo repo;

    public FriendService(FriendshipRepo repo) {
        this.repo = repo;
    }

    // Wyślij zaproszenie
    @Transactional
    public Friendship invite(UUID requesterId, String requesterEmail, String targetEmail) {
        if (requesterEmail.equalsIgnoreCase(targetEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nie możesz zaprosić samego siebie.");
        }

        // Sprawdź czy już nie są znajomymi lub czy nie ma zaproszenia
        var existing = repo.findExistingRelation(requesterId, requesterEmail, targetEmail);
        if (!existing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Zaproszenie lub znajomość już istnieje.");
        }

        Friendship f = new Friendship();
        f.setRequesterId(requesterId);
        f.setRequesterEmail(requesterEmail);
        f.setAddresseeEmail(targetEmail);
        f.setStatus("PENDING");
        return repo.save(f);
    }

    // Pobierz listę znajomych i oczekujących zaproszeń
    public List<Friendship> getMyFriendships(UUID myId, String myEmail) {
        // Pobieramy to co wysłałem i to co dostałem
        List<Friendship> sent = repo.findByRequesterId(myId);
        List<Friendship> received = repo.findByAddresseeEmail(myEmail);
        sent.addAll(received);
        return sent;
    }

    // Zaakceptuj zaproszenie
    @Transactional
    public void accept(UUID friendshipId, String myEmail) {
        Friendship f = repo.findById(friendshipId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!f.getAddresseeEmail().equalsIgnoreCase(myEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "To nie jest zaproszenie do Ciebie.");
        }

        f.setStatus("ACCEPTED");
        repo.save(f);
    }

    // Odrzuć/Usuń znajomego
    @Transactional
    public void remove(UUID friendshipId, UUID myId, String myEmail) {
        Friendship f = repo.findById(friendshipId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // Usuwać może tylko nadawca lub odbiorca
        boolean isMine = f.getRequesterId().equals(myId) || f.getAddresseeEmail().equalsIgnoreCase(myEmail);
        if (!isMine) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        repo.delete(f);
    }
}