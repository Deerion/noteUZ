package org.example.noteuzbackend.dto;

public class AuthRequests {
    public record LoginRequest(String email, String password, String captchaToken) {}
    public record RegisterRequest(String email, String password, String displayName, String captchaToken) {}
}