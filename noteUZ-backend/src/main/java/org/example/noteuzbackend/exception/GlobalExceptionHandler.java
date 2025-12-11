package org.example.noteuzbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Obsługa konkretnych błędów HTTP (np. 404 Not Found, 409 Conflict)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of(
                        "timestamp", Instant.now().toString(),
                        "error", ex.getStatusCode().toString(),
                        "message", ex.getReason()
                ));
    }

    // 2. Obsługa wszystkich innych nieprzewidzianych błędów (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handle(Exception ex) {
        ex.printStackTrace(); // Warto logować błędy 500 w konsoli
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "timestamp", Instant.now().toString(),
                        "error", "Internal Server Error",
                        "message", ex.getMessage()
                ));
    }
}