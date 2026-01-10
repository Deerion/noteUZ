package org.example.noteuzbackend.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "note_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"note_id", "user_id"})
})
public class NoteVote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    public NoteVote() {}

    public NoteVote(Note note, AppUser user) {
        this.note = note;
        this.user = user;
    }

    public UUID getId() { return id; }
    public Note getNote() { return note; }
    public AppUser getUser() { return user; }
}