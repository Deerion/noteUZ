package org.example.noteuzbackend;

import org.example.noteuzbackend.model.entity.Event;
import org.example.noteuzbackend.repository.EventRepo;
import org.example.noteuzbackend.service.EventService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Testy jednostkowe serwisu EventService.
 * Weryfikują operacje na wydarzeniach w kalendarzu.
 */
@ExtendWith(MockitoExtension.class)
class EventCalendarTest {

    @Mock private EventRepo eventRepo;
    @InjectMocks private EventService eventService;

    /**
     * Testuje pobieranie wydarzeń użytkownika w kolejności chronologicznej.
     */
    @Test
    void shouldGetUserEventsOrdered() {
        UUID userId = UUID.randomUUID();
        when(eventRepo.findByUserIdOrderByStartAsc(userId)).thenReturn(List.of(new Event(), new Event()));

        List<Event> events = eventService.getUserEvents(userId);

        assertThat(events)
                .as("Powinna zostać zwrócona lista dokładnie 2 wydarzeń")
                .hasSize(2);

        verify(eventRepo).findByUserIdOrderByStartAsc(userId);
    }

    /**
     * Testuje tworzenie nowego wydarzenia.
     */
    @Test
    void shouldCreateEvent() {
        Event event = new Event();
        event.setTitle("Spotkanie");
        event.setStart(LocalDateTime.now());

        when(eventRepo.save(any(Event.class))).thenReturn(event);

        Event result = eventService.createEvent(event);

        assertThat(result.getTitle())
                .as("Tytuł utworzonego wydarzenia powinien zgadzać się z wejściowym")
                .isEqualTo("Spotkanie");

        verify(eventRepo).save(event);
    }
}