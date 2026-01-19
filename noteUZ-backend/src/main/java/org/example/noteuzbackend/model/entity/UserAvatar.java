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

    public UserAvatar() {}

    public UserAvatar(UUID userId, byte[] data, String contentType) {
        this.userId = userId;
        this.data = data;
        this.contentType = contentType;
    }

    // Getters and Setters
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
}