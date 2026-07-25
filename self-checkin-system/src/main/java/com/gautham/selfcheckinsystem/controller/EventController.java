package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.entity.Event;
import com.gautham.selfcheckinsystem.service.EventService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import com.gautham.selfcheckinsystem.dto.EventDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {

        return ResponseEntity.ok(eventService.getAllEvents());

    }

    @PostMapping
    public ResponseEntity<Event> createEvent(
            @Valid @RequestBody EventDTO eventDTO) {

        Event event = eventService.saveEvent(eventDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(
            @PathVariable Long id) {

        return ResponseEntity.ok(eventService.getEventById(id));

    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventDTO eventDTO) {

        return ResponseEntity.ok(
                eventService.updateEvent(id, eventDTO)
        );

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Long id) {

        eventService.deleteEvent(id);

        return ResponseEntity.ok("Event deleted successfully");

    }
}