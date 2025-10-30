package org.example.noteuzbackend.service;

import org.example.noteuzbackend.model.entity.TestNote;
import org.example.noteuzbackend.repository.TestNoteRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteService {
    private final TestNoteRepo repo;

    public NoteService(TestNoteRepo repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public List<String> listTexts() {
        return repo.findAll().stream().map(TestNote::getText).toList();
    }

    @Transactional
    public TestNote create(String text) {
        TestNote n = new TestNote();
        n.setText(text);
        return repo.save(n);
    }
}
