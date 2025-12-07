package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.model.entity.Friendship;
import org.example.noteuzbackend.service.AuthService;
import org.example.noteuzbackend.service.FriendService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;
    private final AuthService authService;

    public FriendController(FriendService friendService, AuthService authService) {
        this.friendService = friendService;
        this.authService = authService;
    }

    // Helper: Pobierz dane usera z tokena
    private Map<String, Object> getUserData(String token) {
        if (token == null || token.isBlank()) return null;
        ResponseEntity<?> response = authService.getUser(token);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof Map) {
            return (Map<String, Object>) response.getBody();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> list(@CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        var user = getUserData(token);
        if (user == null) return ResponseEntity.status(401).build();

        UUID id = UUID.fromString((String) user.get("id"));
        String email = (String) user.get("email");

        return ResponseEntity.ok(friendService.getMyFriendships(id, email));
    }

    @PostMapping("/invite")
    public ResponseEntity<?> invite(@RequestBody Map<String, String> body,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        var user = getUserData(token);
        if (user == null) return ResponseEntity.status(401).build();

        UUID myId = UUID.fromString((String) user.get("id"));
        String myEmail = (String) user.get("email");
        String targetEmail = body.get("email");

        return ResponseEntity.ok(friendService.invite(myId, myEmail, targetEmail));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable UUID id,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        var user = getUserData(token);
        if (user == null) return ResponseEntity.status(401).build();

        String myEmail = (String) user.get("email");
        friendService.accept(id, myEmail);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(@PathVariable UUID id,
                                    @CookieValue(value = "${app.jwt.cookie}", required = false) String token) {
        var user = getUserData(token);
        if (user == null) return ResponseEntity.status(401).build();

        UUID myId = UUID.fromString((String) user.get("id"));
        String myEmail = (String) user.get("email");

        friendService.remove(id, myId, myEmail);
        return ResponseEntity.noContent().build();
    }
}