package org.example.noteuzbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;

/**
 * Globalny mediator obsługujący wyjątki rzucane przez kontrolery.
 * Przechwytuje błędy i przekształca je w ustandaryzowane odpowiedzi JSON.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Obsługuje wyjątki typu {@link ResponseStatusException}.
     * Wykorzystywane głównie dla konkretnych błędów HTTP, takich jak 404 lub 409.
     *
     * @param ex Wyjątek zawierający status HTTP oraz powód błędu.
     * @return ResponseEntity zawierające szczegóły błędu (znacznik czasu, kod błędu, komunikat).
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of(
                        "timestamp", Instant.now().toString(),
                        "error", ex.getStatusCode().toString(),
                        "message", ex.getReason()
                ));
    }

    /**
     * Obsługuje wszystkie nieoczekiwane wyjątki (ogólna klasa Exception).
     * Zwraca status 500 Internal Server Error i loguje stos wywołań na serwerze.
     *
     * @param ex Przechwycony wyjątek.
     * @return ResponseEntity z ustandaryzowaną informacją o błędzie serwera.
     */
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