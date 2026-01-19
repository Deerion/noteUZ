package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.config.resolver.CurrentUser;
import org.example.noteuzbackend.dto.FriendRequests.InviteFriendRequest;
import org.example.noteuzbackend.dto.UserSummary;
import org.example.noteuzbackend.service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    // ZMIANA: Używamy UserSummary zamiast UUID, żeby mieć też email bez dodatkowych zapytań
    @GetMapping
    public ResponseEntity<?> list(@CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(friendService.getMyFriendships(user.id(), user.email()));
    }

    @PostMapping("/invite")
    public ResponseEntity<?> invite(@RequestBody InviteFriendRequest body, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(friendService.invite(user.id(), user.email(), body.email()));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        friendService.accept(id, user.email());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable UUID id, @CurrentUser UserSummary user) {
        if (user == null) return ResponseEntity.status(401).build();
        friendService.remove(id, user.id(), user.email());
        return ResponseEntity.noContent().build();
    }
}