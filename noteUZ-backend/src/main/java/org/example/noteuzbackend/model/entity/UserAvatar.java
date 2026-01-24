package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "user_avatars")
public class UserAvatar {

    @Id
    private UUID userId; // Klucz główny to ID użytkownika (relacja 1:1)

    @Lob // Oznacza duży obiekt binarny (BLOB)
    @JdbcTypeCode(SqlTypes.VARBINARY) // <--- TO JEST KLUCZOWE
    @Column(name = "data", columnDefinition="bytea") // bytea dla PostgreSQL
    private byte[] data;

    private String contentType; // np. image/jpeg, image/png

    /**
     * Konstruktor domyślny.
     */
    public UserAvatar() {}

    /**
     * Konstruktor tworzący awatar użytkownika.
     * @param userId identyfikator użytkownika
     * @param data dane binarne obrazu
     * @param contentType typ zawartości (np. image/jpeg)
     */
    public UserAvatar(UUID userId, byte[] data, String contentType) {
        this.userId = userId;
        this.data = data;
        this.contentType = contentType;
    }

    /**
     * Pobiera identyfikator użytkownika.
     * @return identyfikator UUID
     */
    public UUID getUserId() { return userId; }

    /**
     * Ustawia identyfikator użytkownika.
     * @param userId identyfikator UUID
     */
    public void setUserId(UUID userId) { this.userId = userId; }

    /**
     * Pobiera dane binarne awatara.
     * @return tablica bajtów obrazu
     */
    public byte[] getData() { return data; }

    /**
     * Ustawia dane binarne awatara.
     * @param data tablica bajtów obrazu
     */
    public void setData(byte[] data) { this.data = data; }

    /**
     * Pobiera typ zawartości awatara.
     * @return typ MIME obrazu
     */
    public String getContentType() { return contentType; }

    /**
     * Ustawia typ zawartości awatara.
     * @param contentType typ MIME obrazu
     */
    public void setContentType(String contentType) { this.contentType = contentType; }
}