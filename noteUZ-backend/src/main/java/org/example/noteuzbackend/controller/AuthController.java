// controller/AuthController.java
package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth){ this.auth = auth; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body){
        return auth.signIn(body.get("email"), body.get("password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(){
        return auth.signOut();
    }
}
