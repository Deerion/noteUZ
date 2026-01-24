package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.util.UUID;
import java.util.Objects;

/**
 * Reprezentuje udostępnienie notatki innemu użytkownikowi.
 * Przechowuje informacje o poziomie uprawnień (np. READ, WRITE), statusie zaproszenia oraz tokenie weryfikacyjnym.
 */
@Entity
@Table(name = "note_shares")
public class NoteShare {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "note_id", nullable = false)
    private UUID noteId;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "recipient_id")
    private UUID recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Permission permission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShareStatus status = ShareStatus.PENDING;

    @Column(nullable = false, unique = true)
    private String token;

    public enum Permission {
        READ,
        WRITE
    }

    public enum ShareStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    /**
     * Pobiera identyfikator udostępnienia.
     * @return identyfikator UUID
     */
    public UUID getId() {
        return id;
    }

    /**
     * Ustawia identyfikator udostępnienia.
     * @param id identyfikator UUID
     */
    public void setId(UUID id) {
        this.id = id;
    }

    /**
     * Pobiera identyfikator udostępnionej notatki.
     * @return identyfikator UUID notatki
     */
    public UUID getNoteId() {
        return noteId;
    }

    /**
     * Ustawia identyfikator udostępnionej notatki.
     * @param noteId identyfikator UUID notatki
     */
    public void setNoteId(UUID noteId) {
        this.noteId = noteId;
    }

    /**
     * Pobiera identyfikator właściciela notatki.
     * @return identyfikator UUID właściciela
     */
    public UUID getOwnerId() {
        return ownerId;
    }

    /**
     * Ustawia identyfikator właściciela notatki.
     * @param ownerId identyfikator UUID właściciela
     */
    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    /**
     * Pobiera email odbiorcy udostępnienia.
     * @return email odbiorcy
     */
    public String getRecipientEmail() {
        return recipientEmail;
    }

    /**
     * Ustawia email odbiorcy udostępnienia.
     * @param recipientEmail email odbiorcy
     */
    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    /**
     * Pobiera identyfikator odbiorcy (użytkownika).
     * @return identyfikator UUID odbiorcy
     */
    public UUID getRecipientId() {
        return recipientId;
    }

    /**
     * Ustawia identyfikator odbiorcy (użytkownika).
     * @param recipientId identyfikator UUID odbiorcy
     */
    public void setRecipientId(UUID recipientId) {
        this.recipientId = recipientId;
    }

    /**
     * Pobiera poziom uprawnień (np. READ, WRITE).
     * @return poziom uprawnień
     */
    public Permission getPermission() {
        return permission;
    }

    /**
     * Ustawia poziom uprawnień.
     * @param permission poziom uprawnień
     */
    public void setPermission(Permission permission) {
        this.permission = permission;
    }

    /**
     * Pobiera status udostępnienia (np. PENDING, ACCEPTED).
     * @return status udostępnienia
     */
    public ShareStatus getStatus() {
        return status;
    }

    /**
     * Ustawia status udostępnienia.
     * @param status status udostępnienia
     */
    public void setStatus(ShareStatus status) {
        this.status = status;
    }

    /**
     * Pobiera token służący do weryfikacji udostępnienia.
     * @return token udostępnienia
     */
    public String getToken() {
        return token;
    }

    /**
     * Ustawia token służący do weryfikacji udostępnienia.
     * @param token token udostępnienia
     */
    public void setToken(String token) {
        this.token = token;
    }

    /**
     * Porównuje ten obiekt z innym na podstawie identyfikatora.
     * @param o obiekt do porównania
     * @return true, jeśli obiekty są równe
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NoteShare noteShare = (NoteShare) o;
        return Objects.equals(id, noteShare.id);
    }

    /**
     * Generuje kod hash na podstawie identyfikatora.
     * @return kod hash
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Zwraca tekstową reprezentację obiektu.
     * @return reprezentacja tekstowa
     */
    @Override
    public String toString() {
        return "NoteShare{" +
                "id=" + id +
                ", noteId=" + noteId +
                ", ownerId=" + ownerId +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", status=" + status +
                '}';
    }
}