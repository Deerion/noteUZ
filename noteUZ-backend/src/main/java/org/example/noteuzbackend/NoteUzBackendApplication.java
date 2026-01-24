package org.example.noteuzbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Główna klasa backendu aplikacji NoteUz.
 */
@SpringBootApplication
public class NoteUzBackendApplication {

    /**
     * Metoda startowa aplikacji.
     * @param args Argumenty wiersza poleceń
     */
    public static void main(String[] args) {
        SpringApplication.run(NoteUzBackendApplication.class, args);
    }

}
