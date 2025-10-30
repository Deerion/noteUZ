package org.example.noteuzbackend.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "test_notes")
public class TestNote {
    @Id
    private UUID id;
    private String text;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
