package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.dto.FriendRequests.InviteFriendRequest;
import org.example.noteuzbackend.dto.UserSummary;
import org.example.noteuzbackend.service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Kontroler obsługujący operacje na znajomościach.
 */
@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    /**
     * Konstruktor kontrolera znajomych.
     * @param friendService Serwis do obsługi znajomości.
     */
    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    /**
     * Pobiera listę znajomości zalogowanego użytkownika.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z listą znajomości.
     */
    @GetMapping
    public ResponseEntity<?> list(@CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(friendService.getMyFriendships(user.id(), user.email()));
    }

    /**
     * Zaprasza użytkownika do znajomych na podstawie adresu email.
     * @param body Dane zaproszenia (email zapraszanego).
     * @param user Podsumowanie danych zalogowanego użytkownika (zapraszającego).
     * @return ResponseEntity z informacją o wysłanym zaproszeniu.
     */
    @PostMapping("/invite")
    public ResponseEntity<?> invite(@RequestBody InviteFriendRequest body, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(friendService.invite(user.id(), user.email(), body.email()));
    }

    /**
     * Akceptuje zaproszenie do znajomych.
     * @param id Identyfikator znajomości (friendship id).
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity z potwierdzeniem akceptacji.
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        friendService.accept(id, user.email());
        return ResponseEntity.ok().build();
    }

    /**
     * Usuwa znajomość lub odrzuca zaproszenie.
     * @param id Identyfikator znajomości.
     * @param user Podsumowanie danych zalogowanego użytkownika.
     * @return ResponseEntity informujące o braku zawartości po usunięciu.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        friendService.remove(id, user.id(), user.email());
        return ResponseEntity.noContent().build();
    }
}