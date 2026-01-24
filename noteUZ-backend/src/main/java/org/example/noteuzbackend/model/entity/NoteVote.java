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

    /**
     * Konstruktor domyślny.
     */
    public NoteVote() {}

    /**
     * Konstruktor tworzący nowy głos.
     * @param note notatka, na którą oddano głos
     * @param user użytkownik, który oddał głos
     */
    public NoteVote(Note note, AppUser user) {
        this.note = note;
        this.user = user;
    }

    /**
     * Pobiera identyfikator głosu.
     * @return identyfikator UUID
     */
    public UUID getId() { return id; }

    /**
     * Pobiera notatkę powiązaną z głosem.
     * @return obiekt notatki
     */
    public Note getNote() { return note; }

    /**
     * Pobiera użytkownika, który oddał głos.
     * @return obiekt użytkownika
     */
    public AppUser getUser() { return user; }
}