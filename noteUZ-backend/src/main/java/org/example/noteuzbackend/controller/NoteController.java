package org.example.noteuzbackend.controller;

import org.example.noteuzbackend.service.NoteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private final NoteService service;
    public NoteController(NoteService service) { this.service = service; }

    @GetMapping
    public List<String> list() {
        return service.listTexts();
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        var text = String.valueOf(body.getOrDefault("text", ""));
        var saved = service.create(text);
        return Map.of("id", saved.getId(), "text", saved.getText());
    }
}
